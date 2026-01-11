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
  formId: Ref<string | null>;
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
  const { steps, formId, formContext } = deps;
  const questionService = useStepQuestionService();

  // ADR-011: Initialize persistence composables
  const { withLock } = useSaveLock();
  const { createFormSteps } = useCreateFormSteps();
  const { deleteFormSteps } = useDeleteFormSteps();
  const { upsertFormSteps } = useUpsertFormSteps();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  function addStep(type: StepType, afterIndex?: number): FormStep {
    return addStepAt({
      steps: steps.value,
      type,
      formId: formId.value ?? '',
      ctx: formContext.value,
      afterIndex,
    });
  }

  /**
   * Async version of addStep that creates a form_question for question/rating steps.
   * The question is created first, then the step is added with the questionId.
   *
   * @param type - The step type to create
   * @param afterIndex - Optional index after which to insert
   * @param displayOrder - Optional explicit display_order for question creation
   *                       (avoids uniqueness conflicts when local array index differs from DB order)
   */
  async function addStepAsync(
    type: StepType,
    afterIndex?: number,
    displayOrder?: number,
  ): Promise<FormStep> {
    const currentFormId = formId.value ?? '';
    const ctx = formContext.value;

    // First, add the step to get its initial state
    const newStep = addStepAt({
      steps: steps.value,
      type,
      formId: currentFormId,
      ctx,
      afterIndex,
    });

    // If this is a question/rating step, create the form_question
    if (questionService.requiresQuestion(type)) {
      const result = await questionService.createQuestionForStep({
        formId: currentFormId,
        stepType: type,
        stepOrder: newStep.stepOrder,
        flowMembership: newStep.flowMembership,
        displayOrder, // Pass explicit order if provided
      });

      if (result) {
        // Find and update the step with the questionId and question data
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
            questionId: result.questionId,
            question: linkedQuestion,
          };

          // Return the updated step (with questionId) instead of the original
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
      formId: formId.value ?? '',
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
   * Creates question first (if needed), then persists the step.
   *
   * Note: Uses computed next step_order to avoid uniqueness conflicts.
   * The local stepOrder (array index) may differ from database step_order.
   */
  async function addStepWithPersist(type: StepType, afterIndex?: number): Promise<FormStep> {
    return withLock('add-step', async () => {
      const currentFormId = formId.value;
      const orgId = currentOrganizationId.value;

      if (!currentFormId || !orgId) {
        throw new Error('Cannot add step: missing formId or organizationId');
      }

      // Compute a unique step_order that fits within SMALLINT (max 32767)
      // Use (steps.length * 100 + random offset) to create a gap between existing orders
      // This ensures new steps get placed after all existing ones
      // Auto-save will normalize the orders later when it syncs all step_orders
      const baseOrder = steps.value.length * 100;
      const randomOffset = Math.floor(Math.random() * 99) + 1;
      const nextStepOrder = Math.min(baseOrder + randomOffset, 32000); // Stay within SMALLINT

      // Create step locally first (with question if needed)
      // Note: addStepAsync will reorder local array, but we'll use nextStepOrder for DB
      const newStep = await addStepAsync(type, afterIndex, nextStepOrder);

      // Persist the step to database with computed step_order
      await createFormSteps({
        inputs: [{
          id: newStep.id,
          form_id: currentFormId,
          organization_id: orgId,
          step_type: newStep.stepType,
          step_order: nextStepOrder, // Use computed order, not local array index
          question_id: newStep.questionId ?? null,
          flow_id: newStep.flowId ?? null,
          flow_membership: newStep.flowMembership ?? 'shared',
          tips: newStep.tips ?? [],
          content: newStep.content ?? {},
          is_active: true,
        }],
      });

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
   * Creates question copy first (if needed), then persists the new step.
   */
  async function duplicateStepWithPersist(index: number): Promise<FormStep | null> {
    return withLock('duplicate-step', async () => {
      const currentFormId = formId.value;
      const orgId = currentOrganizationId.value;

      if (!currentFormId || !orgId) {
        throw new Error('Cannot duplicate step: missing formId or organizationId');
      }

      const sourceStep = steps.value[index];
      if (!sourceStep) return null;

      // Create the duplicate locally
      const newStep = duplicateStep(index);
      if (!newStep) return null;

      // If source has a question, create a new question for the duplicate
      if (questionService.requiresQuestion(newStep.stepType)) {
        const result = await questionService.createQuestionForStep({
          formId: currentFormId,
          stepType: newStep.stepType,
          stepOrder: newStep.stepOrder,
          flowMembership: newStep.flowMembership,
        });

        if (result) {
          // Update the step with the new questionId
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
              questionId: result.questionId,
              question: linkedQuestion,
            };
            newStep.questionId = result.questionId;
          }
        }
      }

      // Persist the new step
      await createFormSteps({
        inputs: [{
          id: newStep.id,
          form_id: currentFormId,
          organization_id: orgId,
          step_type: newStep.stepType,
          step_order: newStep.stepOrder,
          question_id: newStep.questionId ?? null,
          flow_id: newStep.flowId ?? null,
          flow_membership: newStep.flowMembership ?? 'shared',
          tips: newStep.tips ?? [],
          content: newStep.content ?? {},
          is_active: true,
        }],
      });

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
