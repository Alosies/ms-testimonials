import { ref, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep, StepType, FormContext } from '@/shared/stepCards';
import { useConfirmationModal } from '@/shared/widgets/ConfirmationModal';
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

  // Confirmation modal for deletion protection
  const { showBlockedMessage } = useConfirmationModal();

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
   *
   * ADR-009 Phase 2: flowMembership is derived from flow.flow_type via stepTransform.
   * The flowId is the source of truth in the database, but flowMembership is used
   * for UI rendering since it provides the semantic flow type directly.
   */
  function syncFlowFocusForSelectedStep(index: number) {
    const step = steps.value[index];
    if (!step || !branching.isBranchingEnabled.value) {
      branching.setFlowFocus(null);
      return;
    }

    // flowMembership is derived from flow.flow_type by stepTransform
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

  /**
   * Synchronous step addition - used for non-question step types.
   * For question/rating steps, use handleAddStepAsync instead.
   */
  function handleAddStep(type: StepType, afterIndex?: number): number {
    const newStep = stepCrud.addStep(type, afterIndex);
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);
    return newIndex;
  }

  /**
   * Async step addition - creates form_question for question/rating steps.
   * This should be the primary method for adding steps from UI.
   */
  async function handleAddStepAsync(type: StepType, afterIndex?: number): Promise<number> {
    const newStep = await stepCrud.addStepAsync(type, afterIndex);
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
    const stepToRemove = steps.value[index];

    // ADR-009 Phase 2: Prevent deletion of branch point step
    // The branch point question is referenced by flows.branch_question_id with FK RESTRICT,
    // so we show a user-friendly message before the DB constraint would fail.
    if (
      branching.isBranchingEnabled.value &&
      branching.branchPointStep.value &&
      stepToRemove?.id === branching.branchPointStep.value.id
    ) {
      // Get step name from question text (for rating steps) or content title
      const stepName =
        stepToRemove.question?.questionText ||
        (stepToRemove.content as { title?: string })?.title ||
        'Rating Step';
      showBlockedMessage({
        actionType: 'delete_step_blocked',
        entityName: stepName,
      });
      return;
    }

    stepCrud.removeStep(index);
    if (selectedIndex.value >= steps.value.length) {
      selectStep(Math.max(0, steps.value.length - 1));
    }
  }

  function handleCloseEditor() {
    isEditorOpen.value = false;
  }

  // ============================================
  // ADR-011: Persistence Handlers
  // ============================================

  /**
   * Add step with immediate persistence to database.
   * Coordinates local state + selection with DB persistence.
   */
  async function handleAddStepWithPersist(type: StepType, afterIndex?: number): Promise<number> {
    const newStep = await stepCrud.addStepWithPersist(type, afterIndex);
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);
    return newIndex;
  }

  /**
   * Remove step with immediate persistence to database.
   * Same branch point protection as handleRemoveStep.
   */
  async function handleRemoveStepWithPersist(index: number): Promise<void> {
    const stepToRemove = steps.value[index];

    // ADR-009 Phase 2: Prevent deletion of branch point step
    if (
      branching.isBranchingEnabled.value &&
      branching.branchPointStep.value &&
      stepToRemove?.id === branching.branchPointStep.value.id
    ) {
      const stepName =
        stepToRemove.question?.questionText ||
        (stepToRemove.content as { title?: string })?.title ||
        'Rating Step';
      showBlockedMessage({
        actionType: 'delete_step_blocked',
        entityName: stepName,
      });
      return;
    }

    await stepCrud.removeStepWithPersist(index);
    if (selectedIndex.value >= steps.value.length) {
      selectStep(Math.max(0, steps.value.length - 1));
    }
  }

  /**
   * Reorder steps with immediate persistence to database.
   */
  async function handleReorderStepsWithPersist(fromIndex: number, toIndex: number): Promise<void> {
    await stepCrud.reorderStepsWithPersist(fromIndex, toIndex);
  }

  /**
   * Duplicate step with immediate persistence to database.
   */
  async function handleDuplicateStepWithPersist(index: number): Promise<number | null> {
    const newStep = await stepCrud.duplicateStepWithPersist(index);
    if (!newStep) return null;
    const newIndex = steps.value.indexOf(newStep);
    selectStep(newIndex);
    return newIndex;
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
    addStepAsync: stepCrud.addStepAsync,
    removeStep: stepCrud.removeStep,
    updateStep: stepCrud.updateStep,
    updateStepContent: stepCrud.updateStepContent,
    updateStepTips: stepCrud.updateStepTips,
    updateStepQuestion: stepCrud.updateStepQuestion,
    moveStep: stepCrud.moveStep,
    duplicateStep: stepCrud.duplicateStep,
    changeStepType: stepCrud.changeStepType,

    // Coordinated Actions (local-only, for compatibility)
    handleAddStep,
    handleAddStepAsync,
    handleEditStep,
    handleRemoveStep,
    handleCloseEditor,

    // ADR-011: Persistence Actions (immediate save)
    handleAddStepWithPersist,
    handleRemoveStepWithPersist,
    handleReorderStepsWithPersist,
    handleDuplicateStepWithPersist,

    // Raw persist methods from stepCrud
    addStepWithPersist: stepCrud.addStepWithPersist,
    removeStepWithPersist: stepCrud.removeStepWithPersist,
    reorderStepsWithPersist: stepCrud.reorderStepsWithPersist,
    duplicateStepWithPersist: stepCrud.duplicateStepWithPersist,

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
    // ADR-011: Persistence methods for immediate save
    disableBranchingDeleteAllWithPersist: branching.disableBranchingDeleteAllWithPersist,
    disableBranchingKeepTestimonialWithPersist: branching.disableBranchingKeepTestimonialWithPersist,
    disableBranchingKeepImprovementWithPersist: branching.disableBranchingKeepImprovementWithPersist,
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
