import { ref, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep, StepType, FormContext } from '@/shared/stepCards';
import { useStepState } from './useStepState';
import { useTimelineSelection } from './useTimelineSelection';
import { useTimelineStepCrud } from './useTimelineStepCrud';
import { useTimelineBranching } from './useTimelineBranching';
import { useTimelineDesignConfig } from './useTimelineDesignConfig';

/**
 * Timeline Editor - Shared Composable
 *
 * Single source of truth for form timeline editing STATE.
 * Uses createSharedComposable for singleton pattern with full type safety.
 *
 * Composes smaller modules for maintainability:
 * - useStepState: Step array and dirty state management
 * - useTimelineSelection: Selection state and navigation checks
 * - useTimelineStepCrud: Step CRUD operations
 * - useTimelineBranching: Conditional flow branching
 * - useTimelineDesignConfig: Form design customization
 *
 * @see useScrollSnapNavigation - Handles keyboard nav and scroll detection
 * @see FormStudioPage.vue - Sets up scroll navigation with this editor's state
 */
export const useTimelineEditor = createSharedComposable(() => {
  // ============================================
  // Core State
  // ============================================
  const currentFormId = ref<string | null>(null);
  const isEditorOpen = ref(false);
  const editorMode = ref<'edit' | 'add'>('edit');
  const formContext = ref<FormContext>({});

  // ============================================
  // Composed Modules
  // ============================================
  const stepState = useStepState();
  const { steps, originalSteps, isDirty, hasSteps, setStepsCore, markClean, markStepSaved, markStepSavedByOrder, getStepById, resetStepState } = stepState;

  const selection = useTimelineSelection({ steps });
  const { selectedIndex, selectedStep, canGoNext, canGoPrev, selectStep: selectStepCore, selectStepById: selectStepByIdCore, resetSelection } = selection;

  const stepCrud = useTimelineStepCrud({ steps, formId: currentFormId, formContext });

  const branching = useTimelineBranching({
    steps,
    originalSteps,
    formId: currentFormId,
    selectStepById: selectStepByIdCore,
  });

  const design = useTimelineDesignConfig({ formId: currentFormId });

  // ============================================
  // Selection with Flow Focus Sync
  // ============================================

  /**
   * Select a step by index, automatically syncing flow focus for branched steps.
   * This ensures FlowStepCard scrolls into view when selected from sidebar.
   */
  function selectStep(index: number) {
    selectStepCore(index);
    syncFlowFocusForSelectedStep(index);
  }

  /**
   * Select a step by ID, automatically syncing flow focus for branched steps.
   */
  function selectStepById(id: string) {
    selectStepByIdCore(id);
    const index = steps.value.findIndex(s => s.id === id);
    if (index !== -1) {
      syncFlowFocusForSelectedStep(index);
    }
  }

  /**
   * Sync flow focus based on the selected step's flowMembership.
   * Called after selection to ensure branched steps properly scroll into view.
   */
  function syncFlowFocusForSelectedStep(index: number) {
    const step = steps.value[index];
    if (!step || !branching.isBranchingEnabled.value) {
      branching.setFlowFocus(null);
      return;
    }

    const membership = step.flowMembership;
    if (membership === 'testimonial' || membership === 'improvement') {
      branching.setFlowFocus(membership);
    } else {
      branching.setFlowFocus(null);
    }
  }

  // ============================================
  // Form ID & Context Management
  // ============================================
  function setFormId(formId: string) {
    if (currentFormId.value === formId) return;
    currentFormId.value = formId;
    resetStepState();
    resetSelection();
    isEditorOpen.value = false;
    editorMode.value = 'edit';
  }

  function setFormContext(ctx: FormContext) {
    formContext.value = ctx;
  }

  function resetState() {
    currentFormId.value = null;
    resetStepState();
    resetSelection();
    isEditorOpen.value = false;
    editorMode.value = 'edit';
    formContext.value = {};
    design.resetDesignConfig();
  }

  // ============================================
  // Step Loading with Branching Detection
  // ============================================
  function setSteps(newSteps: FormStep[]) {
    setStepsCore(newSteps);
    branching.detectBranchingFromSteps(newSteps);
  }

  // ============================================
  // Coordinated Actions
  // ============================================
  function handleAddStep(type: StepType, afterIndex?: number): number {
    const newStep = stepCrud.addStep(type, afterIndex);
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);
    return newIndex;
  }

  function handleEditStep(index: number) {
    selectStep(index);
    editorMode.value = 'edit';
    isEditorOpen.value = true;
  }

  function handleRemoveStep(index: number) {
    stepCrud.removeStep(index);
    if (selectedIndex.value >= steps.value.length) {
      selectStep(Math.max(0, steps.value.length - 1));
    }
  }

  function handleCloseEditor() {
    isEditorOpen.value = false;
  }

  // ============================================
  // Return API
  // ============================================
  return {
    // Form ID & Context
    currentFormId: readonly(currentFormId),
    setFormId,
    resetState,
    formContext: readonly(formContext),
    setFormContext,

    // Core State
    steps: readonly(steps),
    originalSteps: readonly(originalSteps),
    selectedIndex,
    selectedStep,
    isDirty,
    hasSteps,
    isEditorOpen,
    editorMode,

    // Selection
    canGoNext,
    canGoPrev,
    selectStep,
    selectStepById,

    // Step State
    setSteps,
    markClean,
    markStepSaved,
    markStepSavedByOrder,
    getStepById,

    // Step CRUD Operations
    addStep: stepCrud.addStep,
    removeStep: stepCrud.removeStep,
    updateStep: stepCrud.updateStep,
    updateStepContent: stepCrud.updateStepContent,
    updateStepTips: stepCrud.updateStepTips,
    updateStepQuestion: stepCrud.updateStepQuestion,
    moveStep: stepCrud.moveStep,
    duplicateStep: stepCrud.duplicateStep,
    changeStepType: stepCrud.changeStepType,

    // Coordinated Actions
    handleAddStep,
    handleEditStep,
    handleRemoveStep,
    handleCloseEditor,

    // Branching State
    branchingConfig: readonly(branching.branchingConfig),
    currentFlowFocus: readonly(branching.currentFlowFocus),
    expandedFlow: readonly(branching.expandedFlow),
    isBranchingEnabled: branching.isBranchingEnabled,
    sharedSteps: branching.sharedSteps,
    testimonialSteps: branching.testimonialSteps,
    improvementSteps: branching.improvementSteps,
    branchPointIndex: branching.branchPointIndex,
    branchPointStep: branching.branchPointStep,
    stepsBeforeBranch: branching.stepsBeforeBranch,

    // Branching Operations
    setBranchingConfig: branching.setBranchingConfig,
    enableBranching: branching.enableBranching,
    disableBranching: branching.disableBranching,
    disableBranchingKeepTestimonial: branching.disableBranchingKeepTestimonial,
    disableBranchingKeepImprovement: branching.disableBranchingKeepImprovement,
    disableBranchingDeleteAll: branching.disableBranchingDeleteAll,
    setBranchingThreshold: branching.setBranchingThreshold,
    addStepToFlow: branching.addStepToFlow,
    focusFlow: branching.focusFlow,
    setFlowFocus: branching.setFlowFocus,
    switchFlow: branching.switchFlow,
    expandCurrentFlow: branching.expandCurrentFlow,
    collapseFlow: branching.collapseFlow,
    setExpandedFlow: branching.setExpandedFlow,

    // Design Config State
    designConfig: readonly(design.designConfig),
    primaryColor: design.primaryColor,
    effectivePrimaryColor: design.effectivePrimaryColor,
    logoUrl: design.logoUrl,
    effectiveLogo: design.effectiveLogo,
    orgLogoUrl: design.orgLogoUrl,
    isUsingOrgLogo: design.isUsingOrgLogo,
    hasCustomColor: design.hasCustomColor,
    hasCustomLogo: design.hasCustomLogo,
    designSaving: design.isSaving,
    designSaveError: design.saveError,

    // Design Config Operations
    setDesignConfig: design.setDesignConfig,
    updatePrimaryColor: design.updatePrimaryColor,
    updateLogoUrl: design.updateLogoUrl,
    resetPrimaryColor: design.resetPrimaryColor,
    resetLogoUrl: design.resetLogoUrl,
    resetDesignConfig: design.resetDesignConfig,
  };
});

export type TimelineEditorContext = ReturnType<typeof useTimelineEditor>;
