<script setup lang="ts">
/**
 * Form Studio Page Feature Component
 *
 * Main feature component for the timeline-based form studio.
 * Data loading is handled by useFormStudioData composable.
 *
 * ARCHITECTURE:
 * - useTimelineEditor: Step CRUD and state management (singleton)
 * - useFormStudioData: Form/steps loading and canvas state
 * - useBranchedKeyboardNavigation: Keyboard navigation
 *
 * @see useFormStudioData - Data loading and canvas state
 */
import { computed, toRefs } from 'vue';
import { Kbd } from '@testimonials/ui';
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '../FormEditorHeader.vue';
import { PropertiesPanel } from '../propertiesPanel';
import StepEditorSlideIn from '../stepEditor/StepEditorSlideIn.vue';
import {
  useTimelineEditor,
  useSaveFormSteps,
  useBranchedKeyboardNavigation,
  useFormStudioData,
} from '../../composables/timeline';
import {
  useAutoSaveController,
  useNavigationGuard,
} from '../../composables/autoSave';
import { useScrollSnapNavigation } from '@/shared/composables';
import { useCurrentContextStore } from '@/shared/currentContext';
import TimelineSidebar from './TimelineSidebar.vue';
import TimelineCanvas from './TimelineCanvas.vue';
import BranchedTimelineCanvas from './BranchedTimelineCanvas.vue';
import CanvasErrorState from './CanvasErrorState.vue';

const props = defineProps<{
  formId: string;
}>();

const emit = defineEmits<{
  back: [];
  preview: [];
  publish: [];
}>();

// Initialize editor (state management)
const editor = useTimelineEditor();

// Get current context for save operations
const contextStore = useCurrentContextStore();
const { currentOrganizationId, currentUserId } = toRefs(contextStore);

// Initialize save composable (for structural changes: step CRUD)
const saveComposable = useSaveFormSteps();

// Initialize auto-save controller (for text field changes: debounced saves)
// This registers watchers for form info, questions, options, tips, flows
const autoSave = useAutoSaveController();

// Initialize navigation guard (warns user about unsaved changes)
useNavigationGuard();

// Initialize scroll-snap navigation (scroll detection only for linear mode)
const navigation = useScrollSnapNavigation({
  containerSelector: '.timeline-scroll',
  itemSelector: '[data-step-index]',
  itemCount: () => editor.steps.value.length,
  selectedIndex: editor.selectedIndex,
  onSelect: (index) => editor.selectStep(index),
  enableKeyboard: false,
  enableScrollDetection: false,
});

// Selected step ID for keyboard navigation
const selectedStepId = computed(() => editor.selectedStep.value?.id ?? null);

// Branch-aware keyboard navigation
useBranchedKeyboardNavigation({
  steps: editor.steps,
  selectedStepId,
  isBranchingEnabled: editor.isBranchingEnabled,
  branchPointIndex: editor.branchPointIndex,
  stepsBeforeBranch: editor.stepsBeforeBranch,
  testimonialSteps: editor.testimonialSteps,
  improvementSteps: editor.improvementSteps,
  selectStepById: editor.selectStepById,
  setFlowFocus: editor.setFlowFocus,
  onEditStep: editor.handleEditStep,
  onRemoveStep: editor.handleRemoveStep,
});

// Form data loading and canvas state (extracted to composable)
const formIdRef = computed(() => props.formId);
const {
  formName,
  showCanvasError,
  showCanvasLoading,
  showTimeline,
  handleRetrySteps,
} = useFormStudioData({
  formId: formIdRef,
  editor: {
    steps: editor.steps,
    setFormId: editor.setFormId,
    setFormContext: editor.setFormContext,
    setDesignConfig: editor.setDesignConfig,
    setBranchingConfig: editor.setBranchingConfig,
    setSteps: editor.setSteps,
  },
});

// Computed save status based on actual state
// Combines status from both structural saves (saveComposable) and text auto-saves (autoSave)
// Note: With auto-save, we don't show 'unsaved' - changes are saved automatically
const saveStatus = computed<'saved' | 'saving' | 'unsaved' | 'error' | 'idle'>(() => {
  // Error takes priority
  if (saveComposable.saveError.value || autoSave.saveStatus.value === 'error') {
    return 'error';
  }
  // Saving state from either system
  if (saveComposable.isSaving.value || autoSave.saveStatus.value === 'saving') {
    return 'saving';
  }
  // Auto-save shows 'saved' briefly after successful save
  if (autoSave.saveStatus.value === 'saved') {
    return 'saved';
  }
  // With auto-save, don't show 'unsaved' - just stay idle, system handles it
  return 'idle';
});

// Header handlers
function handleFormNameUpdate(name: string) {
  formName.value = name;
  // TODO: Also mark form name as dirty for saving
}

/**
 * Handle save request from header
 */
async function handleSave() {
  if (!currentOrganizationId.value) {
    console.error('No organization ID available for save');
    return;
  }

  const success = await saveComposable.saveAll(
    currentOrganizationId.value,
    currentUserId.value ?? undefined,
  );

  if (!success && saveComposable.saveError.value) {
    console.error('Save failed:', saveComposable.saveError.value);
  }
}

/**
 * Handle navigation requests from child components (sidebar, canvas, etc.)
 */
function handleNavigate(index: number) {
  navigation.navigateTo(index);
}
</script>

<template>
  <FormEditorLayout>
    <template #header>
      <FormEditorHeader
        :form-name="formName"
        :save-status="saveStatus"
        :can-publish="true"
        @back="emit('back')"
        @preview="emit('preview')"
        @publish="emit('publish')"
        @save="handleSave"
        @update:form-name="handleFormNameUpdate"
      />
    </template>

    <template #sidebar>
      <TimelineSidebar @navigate="handleNavigate" />
    </template>

    <template #canvas-overlay>
      <div
        v-if="showTimeline && editor.steps.value.length > 1"
        class="absolute top-4 right-4 hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50 text-muted-foreground text-sm shadow-sm pointer-events-auto"
      >
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        <span class="ml-1 text-xs">to navigate</span>
        <template v-if="editor.isBranchingEnabled.value">
          <span class="mx-1 text-muted-foreground/50">·</span>
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span class="ml-1 text-xs">switch branch</span>
        </template>
      </div>
    </template>

    <template #timeline>
      <!-- Error State: Show in canvas when steps query fails -->
      <CanvasErrorState
        v-if="showCanvasError || showCanvasLoading"
        :is-loading="showCanvasLoading"
        @retry="handleRetrySteps"
      />
      <!-- Normal State: Show timeline when we have steps -->
      <template v-else-if="showTimeline">
        <BranchedTimelineCanvas v-if="editor.isBranchingEnabled.value" />
        <TimelineCanvas v-else />
      </template>
    </template>

    <template #properties>
      <PropertiesPanel />
    </template>
  </FormEditorLayout>

  <StepEditorSlideIn v-if="showTimeline" @navigate="handleNavigate" />
</template>
