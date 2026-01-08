/**
 * Timeline Step CRUD - Step manipulation operations
 *
 * Provides step CRUD operations that work with the shared step state.
 * Extracted from useTimelineEditor for maintainability.
 *
 * These are wrapper functions that delegate to pure functions in useStepOperations
 * while providing access to the shared form context.
 */
import type { Ref } from 'vue';
import type { FormStep, StepType, StepContent, FormContext } from '@/shared/stepCards';
import {
  addStepAt,
  removeStepAt,
  updateStepAt,
  moveStepAt,
  duplicateStepAt,
  changeStepTypeAt,
} from './useStepOperations';

interface StepCrudDeps {
  steps: Ref<FormStep[]>;
  formId: Ref<string | null>;
  formContext: Ref<FormContext>;
}

export interface TimelineStepCrudReturn {
  addStep: (type: StepType, afterIndex?: number) => FormStep;
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

  function addStep(type: StepType, afterIndex?: number): FormStep {
    return addStepAt(
      steps.value,
      type,
      formId.value ?? '',
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
      formId.value ?? '',
      formContext.value,
    );
  }

  function changeStepType(index: number, newType: StepType) {
    changeStepTypeAt(steps.value, index, newType, formContext.value);
  }

  return {
    addStep,
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
