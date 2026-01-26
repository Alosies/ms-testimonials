/**
 * Timeline Step Operations - Persistence Layer (ADR-014 Phase 6, Code Review)
 *
 * Single-responsibility composable for persisted step operations.
 * Uses unified persistence layers (useStepPersistence).
 *
 * Extracted from useTimelineStepOps per CR-001 (300-line max compliance).
 */
import { ref, readonly, toRefs } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep, StepType, LinkedQuestion } from '@/entities/formStep';
import { useStepPersistence } from '@/entities/formStep';
import { useTimelineState } from './useTimelineState';
import { useTimelineStepOpsLocal } from './useTimelineStepOpsLocal';
import { useStepQuestionService } from './useStepQuestionService';
import { useCurrentContextStore } from '@/shared/currentContext';
import type { TimelineStepOpsPersist, StepAddOptions } from '../../models/timeline';

// Re-export type for consumers (CR-002: types from models/)
export type { TimelineStepOpsPersist } from '../../models/timeline';

// Default question type for new questions
const DEFAULT_QUESTION_TYPE = {
  id: '', uniqueName: 'text_long', name: 'Long Text', category: 'text', inputComponent: 'TextArea',
} as const;

/** Create LinkedQuestion from question service result */
function createLinkedQuestion(qId: string, qText: string, src?: LinkedQuestion | null): LinkedQuestion {
  return {
    id: qId, questionText: qText, placeholder: src?.placeholder ?? null, helpText: src?.helpText ?? null,
    isRequired: src?.isRequired ?? false, minValue: src?.minValue ?? null, maxValue: src?.maxValue ?? null,
    minLength: src?.minLength ?? null, maxLength: src?.maxLength ?? null,
    scaleMinLabel: src?.scaleMinLabel ?? null, scaleMaxLabel: src?.scaleMaxLabel ?? null,
    questionType: src?.questionType ?? DEFAULT_QUESTION_TYPE, options: [],
  };
}

/** Build step creation input for persistence layer
 * ADR-009: flow_membership removed (deprecated, derived from flow on load)
 */
function buildStepInput(step: FormStep, flowId: string, orgId: string, stepOrder: number) {
  return {
    id: step.id, flow_id: flowId, organization_id: orgId, step_type: step.stepType, step_order: stepOrder,
    tips: step.tips ?? [], content: step.content ?? {}, is_active: true,
  };
}

// =============================================================================
// Composable Implementation
// =============================================================================

export const useTimelineStepOpsPersist = createSharedComposable((): TimelineStepOpsPersist => {
  const state = useTimelineState();
  const localOps = useTimelineStepOpsLocal();
  const stepPersistence = useStepPersistence();
  const questionService = useStepQuestionService();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  const isPersisting = ref(false);

  /**
   * Add a step with immediate persistence.
   * Creates are always immediate since server ID is needed for FK references.
   */
  async function addStepWithPersist(type: StepType, options: StepAddOptions = {}): Promise<FormStep | null> {
    const orgId = currentOrganizationId.value;
    const flowId = options.flowId;

    if (!orgId) {
      console.error('[useTimelineStepOpsPersist] Cannot add step: missing organizationId');
      return null;
    }

    if (!flowId) {
      console.error('[useTimelineStepOpsPersist] Cannot add step: missing flowId');
      return null;
    }

    isPersisting.value = true;

    try {
      // Compute a unique step_order within SMALLINT range
      const baseOrder = state.steps.value.length * 100;
      const randomOffset = Math.floor(Math.random() * 99) + 1;
      const nextStepOrder = Math.min(baseOrder + randomOffset, 32000);

      // Add to local state first
      const newStep = localOps.addStepLocal(type, { ...options, flowId });

      // Persist to database (immediate mode)
      const result = await stepPersistence.createStep(buildStepInput(newStep, flowId, orgId, nextStepOrder));

      if (!result.success) {
        console.error('[useTimelineStepOpsPersist] Failed to persist step:', result.error);
        // Rollback local state
        const stepIndex = localOps.getStepIndex(newStep.id);
        if (stepIndex !== -1) {
          localOps.removeStepLocal(stepIndex);
        }
        return null;
      }

      // Create question if needed (ADR-013: question references step via step_id)
      if (questionService.requiresQuestion(type)) {
        const questionResult = await questionService.createQuestionForStep({
          stepId: newStep.id, stepType: type, stepOrder: nextStepOrder,
          flowMembership: newStep.flowMembership, displayOrder: nextStepOrder,
        });
        if (questionResult) {
          const stepIndex = localOps.getStepIndex(newStep.id);
          if (stepIndex >= 0) {
            state.steps.value[stepIndex] = {
              ...state.steps.value[stepIndex],
              question: createLinkedQuestion(questionResult.questionId, questionResult.questionText),
              isNew: false,
            };
            state.originalSteps.value = JSON.parse(JSON.stringify(state.steps.value));
            return state.steps.value[stepIndex];
          }
        }
      }

      // Mark as no longer new and sync dirty tracking
      const finalIndex = localOps.getStepIndex(newStep.id);
      if (finalIndex >= 0) {
        state.steps.value[finalIndex] = { ...state.steps.value[finalIndex], isNew: false };
        state.originalSteps.value = JSON.parse(JSON.stringify(state.steps.value));
      }
      return state.steps.value[finalIndex] ?? newStep;
    } finally {
      isPersisting.value = false;
    }
  }

  /** Remove a step with immediate persistence (deletes always immediate) */
  async function removeStepWithPersist(index: number): Promise<boolean> {
    const step = state.steps.value[index];
    if (!step) return false;

    isPersisting.value = true;

    try {
      const result = await stepPersistence.deleteStep(step.id);
      if (!result.success) { console.error('[useTimelineStepOpsPersist] Failed to delete step:', result.error); return false; }
      localOps.removeStepLocal(index);
      state.originalSteps.value = JSON.parse(JSON.stringify(state.steps.value));
      return true;
    } finally {
      isPersisting.value = false;
    }
  }

  /** Reorder steps with immediate persistence (order must be consistent) */
  async function reorderStepsWithPersist(fromIndex: number, toIndex: number): Promise<boolean> {
    const len = state.steps.value.length;
    if (fromIndex < 0 || fromIndex >= len || toIndex < 0 || toIndex >= len || fromIndex === toIndex) return false;

    isPersisting.value = true;

    try {
      localOps.moveStepLocal(fromIndex, toIndex);
      const updates = state.steps.value.map((step, idx) => ({ id: step.id, step_order: idx }));
      const result = await stepPersistence.updateStepOrders(updates);
      if (!result.success) { console.error('[useTimelineStepOpsPersist] Failed to reorder steps:', result.error); return false; }
      state.originalSteps.value = JSON.parse(JSON.stringify(state.steps.value));
      return true;
    } finally {
      isPersisting.value = false;
    }
  }

  /** Duplicate a step with immediate persistence (creates always immediate) */
  async function duplicateStepWithPersist(index: number): Promise<FormStep | null> {
    const sourceStep = state.steps.value[index];
    if (!sourceStep) return null;

    const orgId = currentOrganizationId.value;

    if (!orgId) {
      console.error('[useTimelineStepOpsPersist] Cannot duplicate step: missing organizationId');
      return null;
    }

    isPersisting.value = true;

    try {
      // Create the duplicate locally
      const newStep = localOps.duplicateStepLocal(index);
      if (!newStep) return null;

      // Persist to database
      const result = await stepPersistence.createStep(buildStepInput(newStep, sourceStep.flowId, orgId, newStep.stepOrder));

      if (!result.success) {
        console.error('[useTimelineStepOpsPersist] Failed to persist duplicated step:', result.error);
        const idx = localOps.getStepIndex(newStep.id);
        if (idx !== -1) localOps.removeStepLocal(idx);
        return null;
      }

      // Create question if needed
      if (questionService.requiresQuestion(newStep.stepType)) {
        const questionResult = await questionService.createQuestionForStep({
          stepId: newStep.id, stepType: newStep.stepType,
          stepOrder: newStep.stepOrder, flowMembership: newStep.flowMembership,
        });
        if (questionResult) {
          const stepIndex = localOps.getStepIndex(newStep.id);
          if (stepIndex >= 0) {
            state.steps.value[stepIndex] = {
              ...state.steps.value[stepIndex],
              question: createLinkedQuestion(questionResult.questionId, questionResult.questionText, sourceStep.question),
              isNew: false,
            };
            state.originalSteps.value = JSON.parse(JSON.stringify(state.steps.value));
            return state.steps.value[stepIndex];
          }
        }
      }

      // Mark as no longer new and sync dirty tracking
      const finalIndex = localOps.getStepIndex(newStep.id);
      if (finalIndex >= 0) {
        state.steps.value[finalIndex] = { ...state.steps.value[finalIndex], isNew: false };
        state.originalSteps.value = JSON.parse(JSON.stringify(state.steps.value));
      }
      return state.steps.value[finalIndex] ?? newStep;
    } finally {
      isPersisting.value = false;
    }
  }

  return { addStepWithPersist, removeStepWithPersist, reorderStepsWithPersist, duplicateStepWithPersist, isPersisting: readonly(isPersisting) };
});
