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
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '@/features/createForm/ui/FormEditorHeader.vue';
import { PropertiesPanel } from '@/features/createForm/ui/propertiesPanel';
import { useTimelineEditor } from '@/features/createForm/composables/timeline/useTimelineEditor';
import { extractEntityIdFromSlug } from '@/shared/urls';
// TODO: Import actual components when Green agent completes G4, G8
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
          @click="editor.selectStep(index)"
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
          <div class="flex items-center justify-between mb-3 px-1">
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
            :class="{ 'ring-2 ring-primary': index === editor.selectedIndex.value }"
            @click="editor.handleEditStep(index)"
          >
            <!-- Card content preview -->
            <div class="p-8 min-h-[280px] flex flex-col items-center justify-center text-center">
              <h3 class="text-xl font-semibold mb-2">
                {{ (step.content as Record<string, unknown>).title || 'Untitled Step' }}
              </h3>
              <p class="text-muted-foreground max-w-sm">
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
</template>

<style scoped>
/* Senja-inspired timeline with scroll-snap and zoom animations */
.timeline-container {
  padding: 0 2rem;
  max-width: 640px;
  margin: 0 auto;
}

/* Spacers allow first/last steps to center */
.timeline-spacer {
  height: 35vh;
  scroll-snap-align: start;
}

/* Each step snaps to center */
.timeline-step {
  scroll-snap-align: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
  transform-origin: center center;
  padding: 1rem 0;
}

/* Active step: full size and opacity */
.timeline-step-active {
  transform: scale(1);
  opacity: 1;
}

/* Inactive steps: slightly smaller and faded */
.timeline-step-inactive {
  transform: scale(0.94);
  opacity: 0.6;
}

.timeline-step-inactive:hover {
  opacity: 0.85;
  transform: scale(0.96);
}

/* Step card styling */
.step-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.step-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05);
  border-color: hsl(var(--primary) / 0.3);
}

/* Timeline connector between steps */
.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0;
}

.connector-line {
  width: 2px;
  height: 1rem;
  background: hsl(var(--border));
}

.connector-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--border));
  margin: 0.25rem 0;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: hsl(var(--muted-foreground));
  scroll-snap-align: center;
}
</style>
