import type { FormStep, StepType } from '../models/stepContent';
import { STEP_TYPE_CONFIGS } from '../constants';

/**
 * Helper functions for step display (labels, icons)
 */

export function getStepLabel(step: FormStep): string {
  if (step.stepType === 'question') {
    return `Q${step.stepOrder}`;
  }
  return STEP_TYPE_CONFIGS[step.stepType]?.shortLabel ?? 'Step';
}

export function getStepIcon(stepType: StepType): string {
  return STEP_TYPE_CONFIGS[stepType]?.icon ?? 'heroicons:document';
}
