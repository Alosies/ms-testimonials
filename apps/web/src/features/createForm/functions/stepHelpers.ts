import type { FormStep, StepType } from '../models/stepContent';

/**
 * Helper functions for step display (labels, icons)
 */

export function getStepLabel(step: FormStep): string {
  switch (step.stepType) {
    case 'welcome': return 'Welcome';
    case 'question': return `Q${step.stepOrder}`;
    case 'rating': return 'Rating';
    case 'consent': return 'Consent';
    case 'contact_info': return 'Contact';
    case 'reward': return 'Reward';
    case 'thank_you': return 'Thanks';
    default: return 'Step';
  }
}

export function getStepIcon(stepType: StepType): string {
  switch (stepType) {
    case 'welcome': return 'heroicons:hand-raised';
    case 'question': return 'heroicons:question-mark-circle';
    case 'rating': return 'heroicons:star';
    case 'consent': return 'heroicons:check-circle';
    case 'contact_info': return 'heroicons:user';
    case 'reward': return 'heroicons:gift';
    case 'thank_you': return 'heroicons:sparkles';
    default: return 'heroicons:document';
  }
}
