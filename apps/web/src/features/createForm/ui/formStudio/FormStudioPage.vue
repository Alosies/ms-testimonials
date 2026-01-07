<script setup lang="ts">
/**
 * Form Studio Page Feature Component
 *
 * Main feature component for the timeline-based form studio.
 * Uses centralized useScrollSnapNavigation for keyboard and scroll handling.
 *
 * ARCHITECTURE:
 * - useTimelineEditor: Step CRUD and state management (singleton)
 * - useScrollSnapNavigation: Keyboard nav + scroll detection (component-level)
 *
 * @see useScrollSnapNavigation - Centralized scroll-snap navigation
 */
import { ref, watch, computed, toRefs } from 'vue';
import { Kbd } from '@testimonials/ui';
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '../FormEditorHeader.vue';
import { PropertiesPanel } from '../propertiesPanel';
import StepEditorSlideIn from '../stepEditor/StepEditorSlideIn.vue';
import { useTimelineEditor, useSaveFormSteps, useBranchedKeyboardNavigation } from '../../composables/timeline';
import { useScrollSnapNavigation } from '@/shared/composables';
import { useGetForm, parseBranchingConfig } from '@/entities/form';
import { useGetFormSteps } from '@/entities/formStep';
import { useCurrentContextStore } from '@/shared/currentContext';
import type { FormStep, StepType, StepContent } from '@/shared/stepCards';
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

// Initialize save composable
const saveComposable = useSaveFormSteps();

// Initialize scroll-snap navigation (scroll detection only for linear mode)
// Keyboard navigation is handled by useBranchedKeyboardNavigation which supports branching
// This is set up at component level to properly bind to DOM lifecycle
// NOTE: Scroll detection is disabled when branching is enabled because branch steps
// use a different layout (FlowColumn) without data-step-index attributes.
// Since branching config is loaded at page initialization, this is evaluated once at setup.
const navigation = useScrollSnapNavigation({
  containerSelector: '.timeline-scroll',
  itemSelector: '[data-step-index]',
  itemCount: () => editor.steps.value.length,
  selectedIndex: editor.selectedIndex,
  onSelect: (index) => editor.selectStep(index),
  enableKeyboard: false,
  enableScrollDetection: false, // Disabled - causes conflicts with branch navigation
});

// Selected step ID for keyboard navigation
const selectedStepId = computed(() => editor.selectedStep.value?.id ?? null);

// Branch-aware keyboard navigation
// Uses useFlowNavigation as single source of truth for flow structure
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
  // Action callbacks for E and D keyboard shortcuts
  onEditStep: editor.handleEditStep,
  onRemoveStep: editor.handleRemoveStep,
});

// Track if design config has been loaded for current form
const designConfigLoaded = ref(false);

// Initialize editor with formId (resets state if formId changes)
watch(() => props.formId, (id) => {
  editor.setFormId(id);
  designConfigLoaded.value = false; // Reset flag when form changes
}, { immediate: true });

// Fetch form data for context
const formQueryVars = computed(() => ({ formId: props.formId }));
const { form } = useGetForm(formQueryVars);

// Update form context when form data loads
// Design config is loaded only ONCE per form to avoid overwriting local changes
watch(form, (loadedForm) => {
  if (loadedForm) {
    editor.setFormContext({
      productName: loadedForm.product_name ?? undefined,
      productDescription: loadedForm.product_description ?? undefined,
    });
    // Update form name from database
    formName.value = loadedForm.name;

    // Load design config only on initial load (not on subsequent updates)
    // This prevents mutation cache updates from overwriting local changes
    if (!designConfigLoaded.value) {
      editor.setDesignConfig(
        loadedForm.settings,
        loadedForm.organization?.logo_url ?? null
      );
      designConfigLoaded.value = true;
    }

    // Load branching config from database
    if (loadedForm.branching_config) {
      const branchingConfig = parseBranchingConfig(loadedForm.branching_config);
      editor.setBranchingConfig(branchingConfig);
    }
  }
}, { immediate: true });

// Fetch form steps
const stepsQueryVars = computed(() => ({ formId: props.formId }));
const { formSteps, error: stepsError, refetch: refetchSteps } = useGetFormSteps(stepsQueryVars);

// Manual retry state tracking (Apollo's refetch doesn't always update error ref)
const isRetrying = ref(false);
const retryError = ref<Error | null>(null);

// Canvas state: show error or loading state in canvas area
// Only show timeline canvas when we have steps loaded
const hasError = computed(() => stepsError.value || retryError.value);

const showCanvasError = computed(() => {
  // Show error if query failed and no steps in editor
  return hasError.value && editor.steps.value.length === 0 && !isRetrying.value;
});

const showCanvasLoading = computed(() => {
  // Show loading during retry or when no steps and no error
  if (isRetrying.value) return true;
  return editor.steps.value.length === 0 && !hasError.value;
});

const showTimeline = computed(() => {
  // Show timeline only when we have steps
  return editor.steps.value.length > 0;
});

// Transform and load steps into editor when data arrives
watch(formSteps, (steps) => {
  if (steps && steps.length > 0) {
    const transformed: FormStep[] = steps.map((step) => ({
      id: step.id,
      formId: step.form_id,
      stepType: step.step_type as StepType,
      stepOrder: step.step_order,
      questionId: step.question_id ?? null,
      question: step.question ? {
        id: step.question.id,
        questionText: step.question.question_text,
        placeholder: step.question.placeholder,
        helpText: step.question.help_text,
        isRequired: step.question.is_required,
        minValue: step.question.min_value,
        maxValue: step.question.max_value,
        minLength: step.question.min_length,
        maxLength: step.question.max_length,
        scaleMinLabel: step.question.scale_min_label,
        scaleMaxLabel: step.question.scale_max_label,
        questionType: {
          id: step.question.question_type.id,
          uniqueName: step.question.question_type.unique_name,
          name: step.question.question_type.name,
          category: step.question.question_type.category,
          inputComponent: step.question.question_type.input_component,
        },
        options: step.question.options.map((opt) => ({
          id: opt.id,
          optionValue: opt.option_value,
          optionLabel: opt.option_label,
          displayOrder: opt.display_order,
          isDefault: opt.is_default,
        })),
      } : null,
      content: (step.content as StepContent) ?? {},
      tips: (step.tips as string[]) ?? [],
      flowMembership: (step.flow_membership as FormStep['flowMembership']) ?? 'shared',
      isActive: step.is_active,
      isNew: false,
      isModified: false,
    }));
    editor.setSteps(transformed);
  }
}, { immediate: true });

// Header state
const formName = ref('Loading...');

// Computed save status based on actual state
const saveStatus = computed<'saved' | 'saving' | 'unsaved' | 'error'>(() => {
  if (saveComposable.saveError.value) return 'error';
  if (saveComposable.isSaving.value) return 'saving';
  if (saveComposable.hasChangesToSave.value) return 'unsaved';
  return 'saved';
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
 * Uses the centralized navigation composable for scroll-snap coordination.
 */
function handleNavigate(index: number) {
  navigation.navigateTo(index);
}

/**
 * Handle retry when steps query fails
 * Note: Apollo's refetch() doesn't throw on GraphQL errors - they're in the result
 */
async function handleRetrySteps() {
  isRetrying.value = true;
  retryError.value = null;

  try {
    const result = await refetchSteps();
    // Check if the result contains errors (GraphQL errors don't throw)
    if (result?.error) {
      retryError.value = result.error;
    } else if (result?.errors?.length) {
      retryError.value = new Error(result.errors[0]?.message ?? 'Query failed');
    }
  } catch (err) {
    // Network errors will throw
    retryError.value = err instanceof Error ? err : new Error('Failed to load steps');
  } finally {
    isRetrying.value = false;
  }
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
