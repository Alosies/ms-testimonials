/**
 * Timeline Step CRUD - Step manipulation operations
 *
 * Provides step CRUD operations that work with the shared step state.
 * Extracted from useTimelineEditor for maintainability.
 *
 * These are wrapper functions that delegate to pure functions in useStepOperations
 * while providing access to the shared form context.
 *
 * ADR-011: Adds *WithPersist methods for immediate save of discrete actions.
 * These methods use the save lock to coordinate with auto-save.
 */
import type { Ref } from 'vue';
import type { FormStep, StepType, StepContent, FormContext, LinkedQuestion } from '@/shared/stepCards';
import {
  addStepAt,
  removeStepAt,
  updateStepAt,
  moveStepAt,
  duplicateStepAt,
  changeStepTypeAt,
} from '../../functions/stepOperations';
import { useStepQuestionService } from './useStepQuestionService';
import { useSaveLock } from '../autoSave';
import { useCreateFormSteps, useDeleteFormSteps, useUpsertFormSteps } from '@/entities/formStep/composables';
import { useCurrentContextStore } from '@/shared/currentContext';
import { toRefs } from 'vue';

interface StepCrudDeps {
  steps: Ref<FormStep[]>;
  // ADR-013: formId removed, steps now belong to flows
  formContext: Ref<FormContext>;
}

export interface TimelineStepCrudReturn {
  // Local-only methods (for compatibility)
  addStep: (type: StepType, afterIndex?: number) => FormStep;
  addStepAsync: (type: StepType, afterIndex?: number) => Promise<FormStep>;
  removeStep: (index: number) => void;
  updateStep: (index: number, updates: Partial<FormStep>) => void;
  updateStepContent: (index: number, content: StepContent) => void;
  updateStepTips: (index: number, tips: string[]) => void;
  updateStepQuestion: (index: number, questionUpdates: Partial<FormStep['question']>) => void;
  moveStep: (fromIndex: number, toIndex: number) => void;
  duplicateStep: (index: number) => FormStep | null;
  changeStepType: (index: number, newType: StepType) => void;

  // ADR-011: Persisting methods (immediate save with lock)
  addStepWithPersist: (type: StepType, afterIndex?: number) => Promise<FormStep>;
  removeStepWithPersist: (index: number) => Promise<void>;
  reorderStepsWithPersist: (fromIndex: number, toIndex: number) => Promise<void>;
  duplicateStepWithPersist: (index: number) => Promise<FormStep | null>;
}

export function useTimelineStepCrud(deps: StepCrudDeps): TimelineStepCrudReturn {
  // ADR-013: formId removed from deps, steps now belong to flows
  const { steps, formContext } = deps;
  const questionService = useStepQuestionService();

  // ADR-011: Initialize persistence composables
  const { withLock } = useSaveLock();
  const { createFormSteps } = useCreateFormSteps();
  const { deleteFormSteps } = useDeleteFormSteps();
  const { upsertFormSteps } = useUpsertFormSteps();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  /**
   * Get the flow ID to use for new steps.
   * ADR-013: Steps belong to flows, flowId is required.
   */
  function getFlowIdForStep(): string {
    const flowIds = formContext.value.flowIds;
    // Prefer shared flow, fallback to any available flow
    return flowIds?.shared ?? flowIds?.testimonial ?? flowIds?.improvement ?? '';
  }

  function addStep(type: StepType, afterIndex?: number): FormStep {
    return addStepAt({
      steps: steps.value,
      type,
      // ADR-013: Use flowId from context
      flowId: getFlowIdForStep(),
      ctx: formContext.value,
      afterIndex,
    });
  }

  /**
   * Async version of addStep that creates a form_question for question/rating steps.
   * ADR-013: Step is created first (local), then question is created with step_id.
   * Note: This is local-only. For persistence, use addStepWithPersist.
   *
   * @param type - The step type to create
   * @param afterIndex - Optional index after which to insert
   * @param displayOrder - Optional explicit display_order for question creation
   *                       (avoids uniqueness conflicts when local array index differs from DB order)
   * @param persistedStepId - Optional step ID if the step was already persisted (for question creation)
   */
  async function addStepAsync(
    type: StepType,
    afterIndex?: number,
    displayOrder?: number,
    persistedStepId?: string,
  ): Promise<FormStep> {
    const ctx = formContext.value;

    // First, add the step to local state
    const newStep = addStepAt({
      steps: steps.value,
      type,
      // ADR-013: Use flowId from context
      flowId: getFlowIdForStep(),
      ctx,
      afterIndex,
    });

    // ADR-013: If step requires a question, create it with step_id
    // Only create question if we have a persisted step ID (question needs to reference step)
    if (questionService.requiresQuestion(type) && persistedStepId) {
      const result = await questionService.createQuestionForStep({
        // ADR-013: Question now references step via step_id
        stepId: persistedStepId,
        stepType: type,
        stepOrder: newStep.stepOrder,
        flowMembership: newStep.flowMembership,
        displayOrder, // Pass explicit order if provided
      });

      if (result) {
        // Find and update the step with the question data
        const stepIndex = steps.value.findIndex(s => s.id === newStep.id);
        if (stepIndex >= 0) {
          // Create a minimal LinkedQuestion object with the new question data
          const linkedQuestion: LinkedQuestion = {
            id: result.questionId,
            questionText: result.questionText,
            placeholder: null,
            helpText: null,
            isRequired: false,
            minValue: null,
            maxValue: null,
            minLength: null,
            maxLength: null,
            scaleMinLabel: null,
            scaleMaxLabel: null,
            questionType: {
              id: '',
              uniqueName: 'text_long',
              name: 'Long Text',
              category: 'text',
              inputComponent: 'TextArea',
            },
            options: [],
          };

          steps.value[stepIndex] = {
            ...steps.value[stepIndex],
            question: linkedQuestion,
          };

          // Return the updated step (with question) instead of the original
          return steps.value[stepIndex];
        }
      }
    }

    return newStep;
  }

  function removeStep(index: number): void {
    removeStepAt(steps.value, index);
  }

  function updateStep(index: number, updates: Partial<FormStep>): void {
    updateStepAt({ steps: steps.value, index, updates });
  }

  function updateStepContent(index: number, content: StepContent): void {
    updateStep(index, { content });
  }

  function updateStepTips(index: number, tips: string[]): void {
    updateStep(index, { tips });
  }

  function updateStepQuestion(index: number, questionUpdates: Partial<FormStep['question']>): void {
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

  function moveStep(fromIndex: number, toIndex: number): void {
    moveStepAt({ steps: steps.value, fromIndex, toIndex });
  }

  function duplicateStep(index: number): FormStep | null {
    return duplicateStepAt({
      steps: steps.value,
      index,
      // ADR-013: formId removed, flowId is taken from original step
      ctx: formContext.value,
    });
  }

  function changeStepType(index: number, newType: StepType): void {
    changeStepTypeAt({ steps: steps.value, index, newType, ctx: formContext.value });
  }

  // ============================================
  // ADR-011: Persistence Methods
  // ============================================

  /**
   * Add a step with immediate persistence.
   * ADR-013: Step is persisted first, then question is created with step_id.
   *
   * Note: Uses computed next step_order to avoid uniqueness conflicts.
   * The local stepOrder (array index) may differ from database step_order.
   */
  async function addStepWithPersist(type: StepType, afterIndex?: number): Promise<FormStep> {
    return withLock('add-step', async () => {
      const orgId = currentOrganizationId.value;
      const flowId = getFlowIdForStep();

      if (!orgId || !flowId) {
        throw new Error('Cannot add step: missing organizationId or flowId');
      }

      // Compute a unique step_order that fits within SMALLINT (max 32767)
      // Use (steps.length * 100 + random offset) to create a gap between existing orders
      // This ensures new steps get placed after all existing ones
      // Auto-save will normalize the orders later when it syncs all step_orders
      const baseOrder = steps.value.length * 100;
      const randomOffset = Math.floor(Math.random() * 99) + 1;
      const nextStepOrder = Math.min(baseOrder + randomOffset, 32000); // Stay within SMALLINT

      // ADR-013: Create step locally first (without question)
      const newStep = addStep(type, afterIndex);

      // ADR-013: Persist the step to database FIRST (step must exist for question to reference)
      await createFormSteps({
        inputs: [{
          id: newStep.id,
          // ADR-013: Steps belong to flows, not forms (form_id removed, question_id removed)
          flow_id: flowId,
          organization_id: orgId,
          step_type: newStep.stepType,
          step_order: nextStepOrder, // Use computed order, not local array index
          flow_membership: newStep.flowMembership ?? 'shared',
          tips: newStep.tips ?? [],
          content: newStep.content ?? {},
          is_active: true,
        }],
      });

      // ADR-013: Now create question if needed (question references step via step_id)
      if (questionService.requiresQuestion(type)) {
        const result = await questionService.createQuestionForStep({
          stepId: newStep.id,
          stepType: type,
          stepOrder: nextStepOrder,
          flowMembership: newStep.flowMembership,
          displayOrder: nextStepOrder,
        });

        if (result) {
          // Update local step with question data
          const stepIndex = steps.value.findIndex(s => s.id === newStep.id);
          if (stepIndex >= 0) {
            const linkedQuestion: LinkedQuestion = {
              id: result.questionId,
              questionText: result.questionText,
              placeholder: null,
              helpText: null,
              isRequired: false,
              minValue: null,
              maxValue: null,
              minLength: null,
              maxLength: null,
              scaleMinLabel: null,
              scaleMaxLabel: null,
              questionType: {
                id: '',
                uniqueName: 'text_long',
                name: 'Long Text',
                category: 'text',
                inputComponent: 'TextArea',
              },
              options: [],
            };

            steps.value[stepIndex] = {
              ...steps.value[stepIndex],
              question: linkedQuestion,
            };
            return steps.value[stepIndex];
          }
        }
      }

      return newStep;
    });
  }

  /**
   * Remove a step with immediate persistence.
   * FK CASCADE handles question/option cleanup.
   */
  async function removeStepWithPersist(index: number): Promise<void> {
    return withLock('remove-step', async () => {
      const step = steps.value[index];
      if (!step) return;

      // Delete from database first (FK CASCADE handles related entities)
      await deleteFormSteps({ ids: [step.id] });

      // Update local state
      removeStep(index);
    });
  }

  /**
   * Reorder steps with immediate persistence.
   * Updates display_order for all affected steps.
   */
  async function reorderStepsWithPersist(fromIndex: number, toIndex: number): Promise<void> {
    return withLock('reorder-steps', async () => {
      // Update local state first
      moveStep(fromIndex, toIndex);

      // Batch update step_order values
      const updates = steps.value.map((step, idx) => ({
        id: step.id,
        step_order: idx,
      }));

      await upsertFormSteps({ inputs: updates });
    });
  }

  /**
   * Duplicate a step with immediate persistence.
   * ADR-013: Step is persisted first, then question is created with step_id.
   */
  async function duplicateStepWithPersist(index: number): Promise<FormStep | null> {
    return withLock('duplicate-step', async () => {
      const orgId = currentOrganizationId.value;

      if (!orgId) {
        throw new Error('Cannot duplicate step: missing organizationId');
      }

      const sourceStep = steps.value[index];
      if (!sourceStep) return null;

      // Create the duplicate locally
      const newStep = duplicateStep(index);
      if (!newStep) return null;

      // ADR-013: Persist the step to database FIRST (step must exist for question to reference)
      await createFormSteps({
        inputs: [{
          id: newStep.id,
          // ADR-013: Steps belong to flows, not forms (form_id removed, question_id removed)
          flow_id: newStep.flowId,
          organization_id: orgId,
          step_type: newStep.stepType,
          step_order: newStep.stepOrder,
          flow_membership: newStep.flowMembership ?? 'shared',
          tips: newStep.tips ?? [],
          content: newStep.content ?? {},
          is_active: true,
        }],
      });

      // ADR-013: Now create question if needed (question references step via step_id)
      if (questionService.requiresQuestion(newStep.stepType)) {
        const result = await questionService.createQuestionForStep({
          stepId: newStep.id,
          stepType: newStep.stepType,
          stepOrder: newStep.stepOrder,
          flowMembership: newStep.flowMembership,
        });

        if (result) {
          // Update the step with the new question
          const stepIndex = steps.value.findIndex(s => s.id === newStep.id);
          if (stepIndex >= 0) {
            const linkedQuestion: LinkedQuestion = {
              id: result.questionId,
              questionText: result.questionText,
              placeholder: sourceStep.question?.placeholder ?? null,
              helpText: sourceStep.question?.helpText ?? null,
              isRequired: sourceStep.question?.isRequired ?? false,
              minValue: sourceStep.question?.minValue ?? null,
              maxValue: sourceStep.question?.maxValue ?? null,
              minLength: sourceStep.question?.minLength ?? null,
              maxLength: sourceStep.question?.maxLength ?? null,
              scaleMinLabel: sourceStep.question?.scaleMinLabel ?? null,
              scaleMaxLabel: sourceStep.question?.scaleMaxLabel ?? null,
              questionType: sourceStep.question?.questionType ?? {
                id: '',
                uniqueName: 'text_long',
                name: 'Long Text',
                category: 'text',
                inputComponent: 'TextArea',
              },
              options: [], // Options would need separate duplication
            };

            steps.value[stepIndex] = {
              ...steps.value[stepIndex],
              question: linkedQuestion,
            };
          }
        }
      }

      return newStep;
    });
  }

  return {
    // Local-only methods (for compatibility)
    addStep,
    addStepAsync,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    updateStepQuestion,
    moveStep,
    duplicateStep,
    changeStepType,

    // ADR-011: Persisting methods
    addStepWithPersist,
    removeStepWithPersist,
    reorderStepsWithPersist,
    duplicateStepWithPersist,
  };
}
