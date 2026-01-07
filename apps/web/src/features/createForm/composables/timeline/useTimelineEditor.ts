import { ref, readonly, computed } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep, StepType, StepContent, FormContext } from '@/shared/stepCards';
import {
  addStepAt,
  removeStepAt,
  updateStepAt,
  moveStepAt,
  duplicateStepAt,
  changeStepTypeAt,
} from './useStepOperations';
import { useTimelineBranching } from './useTimelineBranching';
import { useTimelineDesignConfig } from './useTimelineDesignConfig';

/**
 * Timeline Editor - Shared Composable
 *
 * Single source of truth for form timeline editing STATE.
 * Uses createSharedComposable for singleton pattern with full type safety.
 *
 * ARCHITECTURE NOTE:
 * This composable handles step CRUD and state management ONLY.
 * Scroll-snap navigation (keyboard nav, scroll detection) is handled by
 * useScrollSnapNavigation which should be set up at the component level.
 *
 * Composes smaller modules for maintainability:
 * - useStepOperations: Pure functions for step CRUD
 * - useTimelineBranching: Conditional flow branching
 *
 * Usage:
 * - Page: const editor = useTimelineEditor(); editor.setFormId(formId);
 * - Components: const editor = useTimelineEditor(); // Just import and use
 *
 * @see useScrollSnapNavigation - Handles keyboard nav and scroll detection
 * @see FormStudioPage.vue - Sets up scroll navigation with this editor's state
 */
export const useTimelineEditor = createSharedComposable(() => {
  // ============================================
  // Core State
  // ============================================
  const currentFormId = ref<string | null>(null);
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);
  const selectedIndex = ref(0);
  const isEditorOpen = ref(false);
  const editorMode = ref<'edit' | 'add'>('edit');
  const formContext = ref<FormContext>({});

  // ============================================
  // Computed
  // ============================================
  const isDirty = computed(() =>
    JSON.stringify(steps.value) !== JSON.stringify(originalSteps.value),
  );

  const hasSteps = computed(() => steps.value.length > 0);

  const selectedStep = computed(() =>
    steps.value[selectedIndex.value] ?? null,
  );

  const canGoNext = computed(() =>
    selectedIndex.value < steps.value.length - 1,
  );

  const canGoPrev = computed(() => selectedIndex.value > 0);

  // ============================================
  // Form ID Management
  // ============================================
  function setFormId(formId: string) {
    if (currentFormId.value === formId) return;

    currentFormId.value = formId;
    steps.value = [];
    originalSteps.value = [];
    selectedIndex.value = 0;
    isEditorOpen.value = false;
    editorMode.value = 'edit';
  }

  // Core reset (design reset added via wrapper after design is created)
  function _resetCoreState() {
    currentFormId.value = null;
    steps.value = [];
    originalSteps.value = [];
    selectedIndex.value = 0;
    isEditorOpen.value = false;
    editorMode.value = 'edit';
    formContext.value = {};
  }

  function setFormContext(ctx: FormContext) {
    formContext.value = ctx;
  }

  // ============================================
  // Step State Management
  // ============================================
  function setSteps(newSteps: FormStep[]) {
    steps.value = [...newSteps];
    originalSteps.value = JSON.parse(JSON.stringify(newSteps));
  }

  function markClean() {
    originalSteps.value = JSON.parse(JSON.stringify(steps.value));
  }

  /**
   * Mark a step as saved (update ID if needed, clear isNew/isModified flags)
   * Used by save composable after successful persistence
   */
  function markStepSaved(stepId: string, newId?: string) {
    const step = steps.value.find(s => s.id === stepId || (s.isNew && s.stepOrder.toString() === newId));
    if (step) {
      if (newId && step.id !== newId) {
        step.id = newId;
      }
      step.isNew = false;
      step.isModified = false;
    }
  }

  /**
   * Mark a step as saved by step order (for newly created steps)
   */
  function markStepSavedByOrder(stepOrder: number, newId: string) {
    const step = steps.value.find(s => s.isNew && s.stepOrder === stepOrder);
    if (step) {
      step.id = newId;
      step.isNew = false;
      step.isModified = false;
    }
  }

  function getStepById(id: string): FormStep | undefined {
    return steps.value.find(s => s.id === id);
  }

  // ============================================
  // Selection (no scroll - scroll handled by useScrollSnapNavigation)
  // ============================================

  /**
   * Select a step by index WITHOUT scrolling.
   * For navigation with scrolling, use useScrollSnapNavigation.navigateTo()
   */
  function selectStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      selectedIndex.value = index;
    }
  }

  function selectStepById(id: string) {
    const index = steps.value.findIndex(s => s.id === id);
    if (index !== -1) {
      selectStep(index);
    }
  }

  // ============================================
  // Step Operations (delegated to pure functions)
  // ============================================
  function addStep(type: StepType, afterIndex?: number): FormStep {
    return addStepAt(
      steps.value,
      type,
      currentFormId.value ?? '',
      formContext.value,
      afterIndex,
    );
  }

  function removeStep(index: number) {
    removeStepAt(steps.value, index);
  }

  function updateStep(index: number, updates: Partial<FormStep>) {
    updateStepAt(steps.value, index, updates);
  }

  function updateStepContent(index: number, content: StepContent) {
    updateStep(index, { content });
  }

  function updateStepTips(index: number, tips: string[]) {
    updateStep(index, { tips });
  }

  function updateStepQuestion(index: number, questionUpdates: Partial<FormStep['question']>) {
    const step = steps.value[index];
    if (!step || !step.question) return;

    steps.value[index] = {
      ...step,
      question: {
        ...step.question,
        ...questionUpdates,
      },
      isModified: true,
    };
  }

  function moveStep(fromIndex: number, toIndex: number) {
    moveStepAt(steps.value, fromIndex, toIndex);
  }

  function duplicateStep(index: number): FormStep | null {
    return duplicateStepAt(
      steps.value,
      index,
      currentFormId.value ?? '',
      formContext.value,
    );
  }

  function changeStepType(index: number, newType: StepType) {
    changeStepTypeAt(steps.value, index, newType, formContext.value);
  }

  // ============================================
  // Coordinated Actions
  // ============================================

  /**
   * Add a step and select it. Returns the new index for scrolling.
   * The component should call navigation.navigateTo(index) to scroll.
   */
  function handleAddStep(type: StepType, afterIndex?: number): number {
    const newStep = addStep(type, afterIndex);
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
    removeStep(index);
    if (selectedIndex.value >= steps.value.length) {
      selectStep(Math.max(0, steps.value.length - 1));
    }
  }

  function handleCloseEditor() {
    isEditorOpen.value = false;
  }

  // ============================================
  // Branching (composed from useTimelineBranching)
  // ============================================
  const branching = useTimelineBranching({
    steps,
    originalSteps,
    formId: currentFormId,
    selectStepById,
  });

  // ============================================
  // Design Config (composed from useTimelineDesignConfig)
  // ============================================
  const design = useTimelineDesignConfig({
    formId: currentFormId,
  });

  // Full reset including design config
  function resetState() {
    _resetCoreState();
    design.resetDesignConfig();
  }

  return {
    // Form ID
    currentFormId: readonly(currentFormId),
    setFormId,
    resetState,

    // Form Context
    formContext: readonly(formContext),
    setFormContext,

    // State
    steps: readonly(steps),
    originalSteps: readonly(originalSteps),
    selectedIndex,
    selectedStep,
    isDirty,
    hasSteps,
    isEditorOpen,
    editorMode,

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

    // Selection (for scroll navigation, use useScrollSnapNavigation)
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

    // Operations
    addStep,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    updateStepQuestion,
    moveStep,
    duplicateStep,
    changeStepType,

    // Branching Operations
    setBranchingConfig: branching.setBranchingConfig,
    enableBranching: branching.enableBranching,
    disableBranching: branching.disableBranching,
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

    // Coordinated Actions
    handleAddStep,
    handleEditStep,
    handleRemoveStep,
    handleCloseEditor,
  };
});

export type TimelineEditorContext = ReturnType<typeof useTimelineEditor>;
