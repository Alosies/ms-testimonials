/**
 * Timeline Step CRUD - Step manipulation operations
 *
 * Provides step CRUD operations that work with the shared step state.
 * Extracted from useTimelineEditor for maintainability.
 *
 * These are wrapper functions that delegate to pure functions in useStepOperations
 * while providing access to the shared form context.
 *
 * NOTE: Auto-save will be implemented via ADR-010 Centralized Auto-Save Controller.
 * This composable only handles state mutations, not persistence triggering.
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

interface StepCrudDeps {
  steps: Ref<FormStep[]>;
  formId: Ref<string | null>;
  formContext: Ref<FormContext>;
}

export interface TimelineStepCrudReturn {
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
}

export function useTimelineStepCrud(deps: StepCrudDeps): TimelineStepCrudReturn {
  const { steps, formId, formContext } = deps;
  const questionService = useStepQuestionService();

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
   */
  async function addStepAsync(type: StepType, afterIndex?: number): Promise<FormStep> {
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

  return {
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
  };
}
