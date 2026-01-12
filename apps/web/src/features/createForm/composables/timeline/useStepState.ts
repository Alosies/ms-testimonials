/**
 * Step State - Core step array management
 *
 * Handles the steps array state, dirty tracking, and step lookup/update operations.
 * Extracted from useTimelineEditor for maintainability.
 *
 * ARCHITECTURE NOTE:
 * This manages the raw step array state. For branching-aware operations,
 * use setSteps wrapper in useTimelineEditor which includes branching detection.
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { FormStep } from '@/shared/stepCards';

export interface StepStateReturn {
  // State
  steps: Ref<FormStep[]>;
  originalSteps: Ref<FormStep[]>;
  isDirty: ComputedRef<boolean>;
  hasSteps: ComputedRef<boolean>;

  // Core step setter (without branching detection)
  setStepsCore: (newSteps: FormStep[]) => void;

  // State management
  markClean: () => void;
  markStepSaved: (stepId: string, newId?: string) => void;
  markStepSavedByOrder: (stepOrder: number, newId: string) => void;
  getStepById: (id: string) => FormStep | undefined;
  resetStepState: () => void;
}

export function useStepState(): StepStateReturn {
  // ============================================
  // State
  // ============================================
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);

  // ============================================
  // Computed
  // ============================================

  /**
   * Extract structural fields from a step for dirty comparison.
   * Only compares fields that represent structural changes:
   * - Step presence (id)
   * - Step order (stepOrder)
   * - Flow assignment (flowId, flowMembership)
   * - Step type (stepType)
   *
   * Content fields (content, tips, question text) are NOT compared here.
   * They are tracked via step.isModified and handled by auto-save.
   */
  function getStructuralFields(step: FormStep) {
    return {
      id: step.id,
      stepOrder: step.stepOrder,
      flowId: step.flowId,
      flowMembership: step.flowMembership,
      stepType: step.stepType,
      // ADR-013: questionId removed (inverted relationship - question references step)
      isActive: step.isActive,
    };
  }

  /**
   * Tracks structural changes only (step additions, deletions, reordering, flow changes).
   * Content changes are tracked separately via step.isModified and handled by auto-save.
   */
  const isDirty = computed(() => {
    if (steps.value.length !== originalSteps.value.length) return true;

    const currentStructure = steps.value.map(getStructuralFields);
    const originalStructure = originalSteps.value.map(getStructuralFields);

    return JSON.stringify(currentStructure) !== JSON.stringify(originalStructure);
  });

  const hasSteps = computed(() => steps.value.length > 0);

  // ============================================
  // Core Operations
  // ============================================

  /**
   * Core step setter without branching detection.
   * Use setSteps wrapper in useTimelineEditor for external use (includes branching detection).
   */
  function setStepsCore(newSteps: FormStep[]) {
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

  function resetStepState() {
    steps.value = [];
    originalSteps.value = [];
  }

  return {
    // State
    steps,
    originalSteps,
    isDirty,
    hasSteps,

    // Core step setter
    setStepsCore,

    // State management
    markClean,
    markStepSaved,
    markStepSavedByOrder,
    getStepById,
    resetStepState,
  };
}
