import { type Ref } from 'vue';
import type { FormStep, StepType } from '../../models/stepContent';
import {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from '../../functions';

function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useStepOperations(steps: Ref<FormStep[]>, formId: Ref<string>) {

  function createStep(type: StepType, order: number): FormStep {
    const baseStep: FormStep = {
      id: generateTempId(),
      formId: formId.value,
      stepType: type,
      stepOrder: order,
      questionId: null,
      content: {},
      tips: [],
      isActive: true,
      isNew: true,
      isModified: false,
    };

    // Set default content based on type
    switch (type) {
      case 'welcome':
        baseStep.content = createDefaultWelcomeContent();
        break;
      case 'thank_you':
        baseStep.content = createDefaultThankYouContent();
        break;
      case 'contact_info':
        baseStep.content = createDefaultContactInfoContent();
        break;
      case 'consent':
        baseStep.content = createDefaultConsentContent();
        break;
      case 'reward':
        baseStep.content = createDefaultRewardContent();
        break;
      case 'question':
      case 'rating':
        // These need question_id, handled separately
        break;
    }

    return baseStep;
  }

  function addStep(type: StepType, afterIndex?: number): FormStep {
    const insertIndex = afterIndex !== undefined
      ? afterIndex + 1
      : steps.value.length;

    const newStep = createStep(type, insertIndex);

    // Insert and reorder
    steps.value.splice(insertIndex, 0, newStep);
    reorderSteps();

    return newStep;
  }

  function removeStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      steps.value.splice(index, 1);
      reorderSteps();
    }
  }

  function updateStep(index: number, updates: Partial<FormStep>) {
    if (index >= 0 && index < steps.value.length) {
      steps.value[index] = {
        ...steps.value[index],
        ...updates,
        isModified: true,
      };
    }
  }

  function updateStepContent(index: number, content: FormStep['content']) {
    updateStep(index, { content });
  }

  function updateStepTips(index: number, tips: string[]) {
    updateStep(index, { tips });
  }

  function reorderSteps() {
    steps.value.forEach((step, index) => {
      step.stepOrder = index;
    });
  }

  function moveStep(fromIndex: number, toIndex: number) {
    if (
      fromIndex >= 0 && fromIndex < steps.value.length &&
      toIndex >= 0 && toIndex < steps.value.length
    ) {
      const [removed] = steps.value.splice(fromIndex, 1);
      steps.value.splice(toIndex, 0, removed);
      reorderSteps();
    }
  }

  function duplicateStep(index: number): FormStep | null {
    const original = steps.value[index];
    if (!original) return null;

    const duplicate = createStep(original.stepType, index + 1);
    duplicate.content = JSON.parse(JSON.stringify(original.content));
    duplicate.tips = [...original.tips];

    steps.value.splice(index + 1, 0, duplicate);
    reorderSteps();

    return duplicate;
  }

  return {
    addStep,
    removeStep,
    updateStep,
    updateStepContent,
    updateStepTips,
    moveStep,
    duplicateStep,
  };
}
