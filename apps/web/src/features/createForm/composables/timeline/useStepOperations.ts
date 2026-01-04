/**
 * Step Operations - Pure functions for step manipulation
 *
 * Extracted from useTimelineEditor to keep composable under 300 lines.
 * These are pure functions that operate on step arrays.
 */
import type { FormStep, StepType, StepContent, FormContext } from '@/shared/stepCards';
import {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from '../../functions';

/**
 * Generate a temporary ID for new steps
 */
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new step with default content based on type
 */
export function createStep(
  type: StepType,
  order: number,
  formId: string,
  ctx: FormContext = {},
): FormStep {
  const baseStep: FormStep = {
    id: generateTempId(),
    formId,
    stepType: type,
    stepOrder: order,
    questionId: null,
    content: {},
    tips: [],
    flowMembership: 'shared',
    isActive: true,
    isNew: true,
    isModified: false,
  };

  // Set default content based on type
  switch (type) {
    case 'welcome':
      baseStep.content = createDefaultWelcomeContent(ctx);
      break;
    case 'thank_you':
      baseStep.content = createDefaultThankYouContent(ctx);
      break;
    case 'contact_info':
      baseStep.content = createDefaultContactInfoContent(ctx);
      break;
    case 'consent':
      baseStep.content = createDefaultConsentContent(ctx);
      break;
    case 'reward':
      baseStep.content = createDefaultRewardContent(ctx);
      break;
    case 'question':
    case 'rating':
      // These need question_id, handled separately
      break;
  }

  return baseStep;
}

/**
 * Reorder steps array by updating stepOrder
 */
export function reorderSteps(steps: FormStep[]): void {
  steps.forEach((step, index) => {
    step.stepOrder = index;
  });
}

/**
 * Add a step at a specific position
 */
export function addStepAt(
  steps: FormStep[],
  type: StepType,
  formId: string,
  ctx: FormContext,
  afterIndex?: number,
): FormStep {
  const insertIndex = afterIndex !== undefined
    ? afterIndex + 1
    : steps.length;

  const newStep = createStep(type, insertIndex, formId, ctx);
  steps.splice(insertIndex, 0, newStep);
  reorderSteps(steps);

  return newStep;
}

/**
 * Remove a step at a specific index
 */
export function removeStepAt(steps: FormStep[], index: number): void {
  if (index >= 0 && index < steps.length) {
    steps.splice(index, 1);
    reorderSteps(steps);
  }
}

/**
 * Update a step at a specific index
 */
export function updateStepAt(
  steps: FormStep[],
  index: number,
  updates: Partial<FormStep>,
): void {
  if (index >= 0 && index < steps.length) {
    steps[index] = {
      ...steps[index],
      ...updates,
      isModified: true,
    };
  }
}

/**
 * Move a step from one position to another
 */
export function moveStepAt(
  steps: FormStep[],
  fromIndex: number,
  toIndex: number,
): void {
  if (
    fromIndex >= 0 && fromIndex < steps.length &&
    toIndex >= 0 && toIndex < steps.length
  ) {
    const [removed] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, removed);
    reorderSteps(steps);
  }
}

/**
 * Duplicate a step at a specific index
 */
export function duplicateStepAt(
  steps: FormStep[],
  index: number,
  formId: string,
  ctx: FormContext,
): FormStep | null {
  const original = steps[index];
  if (!original) return null;

  const duplicate = createStep(original.stepType, index + 1, formId, ctx);
  duplicate.content = JSON.parse(JSON.stringify(original.content));
  duplicate.tips = [...original.tips];
  duplicate.flowMembership = original.flowMembership;

  steps.splice(index + 1, 0, duplicate);
  reorderSteps(steps);

  return duplicate;
}

/**
 * Change the type of a step at a specific index
 */
export function changeStepTypeAt(
  steps: FormStep[],
  index: number,
  newType: StepType,
  ctx: FormContext,
): void {
  const step = steps[index];
  if (!step || step.stepType === newType) return;

  let newContent: StepContent = {};

  switch (newType) {
    case 'welcome':
      newContent = createDefaultWelcomeContent(ctx);
      break;
    case 'thank_you':
      newContent = createDefaultThankYouContent(ctx);
      break;
    case 'contact_info':
      newContent = createDefaultContactInfoContent(ctx);
      break;
    case 'consent':
      newContent = createDefaultConsentContent(ctx);
      break;
    case 'reward':
      newContent = createDefaultRewardContent(ctx);
      break;
    case 'question':
    case 'rating':
      newContent = {};
      break;
  }

  steps[index] = {
    ...step,
    stepType: newType,
    content: newContent,
    questionId: null,
    isModified: true,
  };
}
