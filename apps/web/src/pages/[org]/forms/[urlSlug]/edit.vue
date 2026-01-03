<script setup lang="ts">
/**
 * Edit form page - Timeline Editor
 * Route: /:org/forms/:urlSlug/edit
 *
 * Uses Notion-inspired URL pattern: {readable-slug}_{entity_id}
 * The slug is cosmetic; only the entity_id is used for data fetching.
 */
import { computed, provide, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { definePage } from 'unplugin-vue-router/runtime';
import { onKeyStroke } from '@vueuse/core';
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '@/features/createForm/ui/FormEditorHeader.vue';
import { PropertiesPanel } from '@/features/createForm/ui/propertiesPanel';
import StepEditorSlideIn from '@/features/createForm/ui/stepEditor/StepEditorSlideIn.vue';
import { useTimelineEditor } from '@/features/createForm/composables/timeline/useTimelineEditor';
import { extractEntityIdFromSlug } from '@/shared/urls';
// TODO: Import Green agent components when ready
// import StepsSidebar from '@/features/createForm/ui/stepsSidebar/StepsSidebar.vue';
// import TimelineCanvas from '@/features/createForm/ui/timelineCanvas/TimelineCanvas.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute();
const router = useRouter();

const urlSlug = computed(() => route.params.urlSlug as string);

const formId = computed(() => {
  const result = extractEntityIdFromSlug(urlSlug.value);
  // If extraction succeeds, use the entityId; otherwise treat the whole slug as an ID
  return result?.isValid ? result.entityId : urlSlug.value;
});

const editor = useTimelineEditor(formId);

// Provide editor context to child components
provide('timelineEditor', editor);

// Header state
const formName = ref('My Test Form');
const saveStatus = ref<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

// Header handlers
function handleBack() {
  router.push({ name: '/[org]/forms/', params: { org: route.params.org } });
}

function handlePreview() {
  // TODO: Open preview mode
}

function handlePublish() {
  // TODO: Publish form
}

function handleFormNameUpdate(name: string) {
  formName.value = name;
  saveStatus.value = 'unsaved';
}

// Keyboard navigation for timeline using VueUse
function isInputFocused() {
  const el = document.activeElement;
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
}

function navigateNext() {
  if (isInputFocused()) return;
  const stepsCount = editor.steps.value.length;
  const currentIndex = editor.selectedIndex.value ?? 0;
  if (stepsCount > 0 && currentIndex < stepsCount - 1) {
    const newIndex = currentIndex + 1;
    editor.selectStep(newIndex);
    editor.scrollToStep(newIndex);
  }
}

function navigatePrev() {
  if (isInputFocused()) return;
  const currentIndex = editor.selectedIndex.value ?? 0;
  if (currentIndex > 0) {
    const newIndex = currentIndex - 1;
    editor.selectStep(newIndex);
    editor.scrollToStep(newIndex);
  }
}

function openEditor() {
  if (isInputFocused()) return;
  const currentIndex = editor.selectedIndex.value ?? 0;
  if (editor.steps.value.length > 0) {
    editor.handleEditStep(currentIndex);
  }
}

// Arrow keys and vim-style navigation
onKeyStroke(['ArrowDown', 'j'], navigateNext, { eventName: 'keydown' });
onKeyStroke(['ArrowUp', 'k'], navigatePrev, { eventName: 'keydown' });
onKeyStroke(['Enter', ' '], openEditor, { eventName: 'keydown' });
</script>

<template>
  <FormEditorLayout>
    <template #header>
      <FormEditorHeader
        :form-name="formName"
        :save-status="saveStatus"
        :can-publish="true"
        @back="handleBack"
        @preview="handlePreview"
        @publish="handlePublish"
        @update:form-name="handleFormNameUpdate"
      />
    </template>

    <template #sidebar>
      <!-- TODO: Replace with StepsSidebar when Green completes G4 -->
      <div class="p-2 text-xs text-muted-foreground">
        <div class="mb-2 font-semibold">STEPS</div>
        <div
          v-for="(step, index) in editor.steps.value"
          :key="step.id"
          class="mb-2 p-2 bg-background rounded cursor-pointer"
          :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
          @click="editor.selectStep(index); editor.scrollToStep(index)"
        >
          {{ index + 1 }}. {{ step.stepType }}
        </div>
        <button
          class="w-full p-2 border border-dashed rounded text-center hover:bg-muted/50"
          @click="editor.handleAddStep('question')"
        >
          + Add
        </button>
      </div>
    </template>

    <template #timeline>
      <!-- TODO: Replace with TimelineCanvas when Green completes G8 -->
      <!-- Senja-inspired scroll-snap timeline with zoom animations -->
      <div class="timeline-container">
        <!-- Top spacer for first step centering -->
        <div class="timeline-spacer" />

        <div
          v-for="(step, index) in editor.steps.value"
          :key="step.id"
          :data-step-index="index"
          class="timeline-step"
          :class="{
            'timeline-step-active': index === editor.selectedIndex.value,
            'timeline-step-inactive': index !== editor.selectedIndex.value,
          }"
        >
          <!-- Step header bar -->
          <div class="flex items-center justify-between mb-2 px-1">
            <div class="flex items-center gap-2">
              <span
                class="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                :class="{
                  'bg-primary text-primary-foreground': index === editor.selectedIndex.value,
                  'bg-muted text-muted-foreground': index !== editor.selectedIndex.value,
                }"
              >
                {{ index + 1 }}
              </span>
              <span class="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {{ step.stepType.replace('_', ' ') }}
              </span>
            </div>
          </div>

          <!-- Step card (large, Senja-style) -->
          <div
            class="step-card"
            :class="{ 'ring-2 ring-primary ring-offset-2': index === editor.selectedIndex.value }"
            @click="editor.handleEditStep(index)"
          >
            <!-- Card content preview - Large centered content -->
            <div class="step-card-content">
              <h3 class="text-2xl font-semibold mb-3">
                {{ (step.content as Record<string, unknown>).title || 'Untitled Step' }}
              </h3>
              <p class="text-lg text-muted-foreground max-w-md leading-relaxed">
                {{ (step.content as Record<string, unknown>).subtitle || (step.content as Record<string, unknown>).message || (step.content as Record<string, unknown>).description || 'Click to edit this step' }}
              </p>
            </div>
          </div>

          <!-- Connector to next step -->
          <div v-if="index < editor.steps.value.length - 1" class="timeline-connector">
            <div class="connector-line" />
            <div class="connector-dot" />
            <div class="connector-line" />
          </div>
        </div>

        <!-- Bottom spacer for last step centering -->
        <div class="timeline-spacer" />

        <!-- Empty state -->
        <div v-if="editor.steps.value.length === 0" class="empty-state">
          <p class="mb-4">No steps yet. Add your first step to get started.</p>
          <button
            class="px-6 py-3 border-2 border-dashed rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all"
            @click="editor.handleAddStep('welcome')"
          >
            + Add Welcome Step
          </button>
        </div>
      </div>
    </template>

    <template #properties>
      <PropertiesPanel />
    </template>
  </FormEditorLayout>

  <!-- Step Editor Slide-in Panel (B6) -->
  <StepEditorSlideIn />
</template>

<style scoped>
/* Senja-inspired timeline with scroll-snap and zoom animations */
.timeline-container {
  padding: 0 3rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Spacers allow first/last steps to center in viewport */
.timeline-spacer {
  height: 40vh;
  scroll-snap-align: start;
}

/* Each step snaps to center */
.timeline-step {
  scroll-snap-align: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  transform-origin: center center;
  padding: 0.5rem 0;
}

/* Active step: full size and opacity */
.timeline-step-active {
  transform: scale(1);
  opacity: 1;
}

/* Inactive steps: smaller and faded for visual hierarchy */
.timeline-step-inactive {
  transform: scale(0.88);
  opacity: 0.5;
}

.timeline-step-inactive:hover {
  opacity: 0.75;
  transform: scale(0.91);
}

/* Step card styling - Large Senja-style cards mimicking webpage screens */
.step-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 1rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.05),
    0 2px 4px -2px rgb(0 0 0 / 0.05),
    0 0 0 1px rgb(0 0 0 / 0.02);
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
  /* Webpage-like aspect ratio (16:10 like a screen) */
  aspect-ratio: 16 / 10;
  width: 100%;
}

.step-card:hover {
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: hsl(var(--primary) / 0.4);
  transform: translateY(-2px);
}

/* Card content - Centered content for screen-like feel */
.step-card-content {
  padding: 3rem 2.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Timeline connector between steps - connects cards visually */
.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: -1px 0; /* Overlap slightly with card borders */
}

.connector-line {
  width: 2px;
  height: 2rem;
  background: hsl(var(--border));
}

.connector-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: hsl(var(--muted-foreground) / 0.3);
  margin: 0.25rem 0;
  flex-shrink: 0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: hsl(var(--muted-foreground));
  scroll-snap-align: center;
}
</style>
