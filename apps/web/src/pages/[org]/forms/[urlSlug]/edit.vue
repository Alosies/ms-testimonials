<script setup lang="ts">
/**
 * Edit form page - Timeline Editor
 * Route: /:org/forms/:urlSlug/edit
 *
 * Uses Notion-inspired URL pattern: {readable-slug}_{entity_id}
 * The slug is cosmetic; only the entity_id is used for data fetching.
 */
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue';
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

// Scroll-based step detection
// Uses scroll event with throttling to find the step closest to viewport center
const timelineRef = ref<HTMLElement | null>(null);
let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

function findCenteredStep() {
  if (!timelineRef.value) return;

  const container = timelineRef.value;
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.top + containerRect.height / 2;

  const stepElements = container.querySelectorAll('[data-step-index]');
  let closestIndex = -1;
  let closestDistance = Infinity;

  stepElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const distance = Math.abs(elementCenter - containerCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      const indexAttr = el.getAttribute('data-step-index');
      if (indexAttr !== null) {
        closestIndex = parseInt(indexAttr, 10);
      }
    }
  });

  // Update selection if a different step is now centered
  if (closestIndex !== -1 && closestIndex !== editor.selectedIndex.value) {
    editor.selectStep(closestIndex);
  }
}

function handleScroll() {
  // Throttle scroll handling to avoid excessive updates
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  scrollTimeout = setTimeout(() => {
    findCenteredStep();
  }, 50);
}

function setupScrollObserver() {
  if (!timelineRef.value) return;

  // Remove existing listener
  timelineRef.value.removeEventListener('scroll', handleScroll);

  // Add scroll listener
  timelineRef.value.addEventListener('scroll', handleScroll, { passive: true });
}

// Re-setup observer when steps change
watch(
  () => editor.steps.value.length,
  () => {
    nextTick(() => setupScrollObserver());
  }
);

onMounted(() => {
  nextTick(() => {
    timelineRef.value = document.querySelector('.timeline-scroll');
    setupScrollObserver();
  });
});

onUnmounted(() => {
  if (timelineRef.value) {
    timelineRef.value.removeEventListener('scroll', handleScroll);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
});
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
          <!-- Step header (outside card - shows step number reference) -->
          <div class="step-header">
            <span
              class="flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold"
              :class="{
                'bg-primary text-primary-foreground': index === editor.selectedIndex.value,
                'bg-muted text-muted-foreground': index !== editor.selectedIndex.value,
              }"
            >
              {{ index + 1 }}
            </span>
            <span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {{ step.stepType.replace('_', ' ') }}
            </span>
          </div>

          <!-- Step card (webpage preview - shows how the actual page will look) -->
          <div
            class="step-card"
            :class="{ 'ring-2 ring-primary ring-offset-4': index === editor.selectedIndex.value }"
            @click="editor.handleEditStep(index)"
          >
            <!-- Card content - Mimics actual webpage appearance -->
            <div class="step-card-content">
              <h3 class="text-3xl font-bold mb-4">
                {{ (step.content as Record<string, unknown>).title || 'Untitled Step' }}
              </h3>
              <p class="text-xl text-muted-foreground max-w-lg leading-relaxed">
                {{ (step.content as Record<string, unknown>).subtitle || (step.content as Record<string, unknown>).message || (step.content as Record<string, unknown>).description || 'Click to edit this step' }}
              </p>
            </div>
          </div>

          <!-- Timeline connector to next step -->
          <div v-if="index < editor.steps.value.length - 1" class="timeline-connector">
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
  padding: 0 2rem;
  max-width: 990px; /* 10% larger than 900px */
  margin: 0 auto;
}

/* Spacers allow first/last steps to center in viewport */
.timeline-spacer {
  height: 15vh;
  scroll-snap-align: start;
}

/* Each step snaps to center */
.timeline-step {
  scroll-snap-align: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  transform-origin: center center;
  margin-bottom: 1.5rem;
}

/* Active step: full size and opacity */
.timeline-step-active {
  transform: scale(1);
  opacity: 1;
}

/* Inactive steps: smaller and faded for visual hierarchy */
.timeline-step-inactive {
  transform: scale(0.92);
  opacity: 0.5;
}

.timeline-step-inactive:hover {
  opacity: 0.7;
  transform: scale(0.94);
}

/* Step header (outside card) - shows step number reference */
.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
}

/* Step card styling - Cards with webpage aspect ratio (like Senja ~1.55:1) */
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
  /* Webpage-like aspect ratio (16:10 ≈ 1.6:1) instead of fixed height */
  aspect-ratio: 16 / 10;
  display: flex;
  flex-direction: column;
}

.step-card:hover {
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: hsl(var(--primary) / 0.4);
}

/* Card content - Centered content mimicking actual webpage */
.step-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2.5rem;
}

/* Timeline connector between steps */
.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connector-line {
  width: 2px;
  height: 6rem;
  background: linear-gradient(
    to bottom,
    hsl(var(--border)),
    hsl(var(--muted-foreground) / 0.3),
    hsl(var(--border))
  );
  border-radius: 1px;
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
