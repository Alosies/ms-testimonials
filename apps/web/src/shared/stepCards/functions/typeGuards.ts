import type {
  FormStep,
  WelcomeContent,
  ConsentContent,
  ContactInfoContent,
  RewardContent,
  ThankYouContent,
} from '../models/stepContent';

/**
 * Type guards for FormStep variants
 * Use these to narrow step types and access type-specific content
 */

export function isWelcomeStep(
  step: FormStep,
): step is FormStep & { stepType: 'welcome'; content: WelcomeContent } {
  return step.stepType === 'welcome';
}

export function isQuestionStep(
  step: FormStep,
): step is FormStep & { stepType: 'question' } {
  return step.stepType === 'question';
}

export function isRatingStep(
  step: FormStep,
): step is FormStep & { stepType: 'rating' } {
  return step.stepType === 'rating';
}

export function isConsentStep(
  step: FormStep,
): step is FormStep & { stepType: 'consent'; content: ConsentContent } {
  return step.stepType === 'consent';
}

export function isContactInfoStep(
  step: FormStep,
): step is FormStep & { stepType: 'contact_info'; content: ContactInfoContent } {
  return step.stepType === 'contact_info';
}

export function isRewardStep(
  step: FormStep,
): step is FormStep & { stepType: 'reward'; content: RewardContent } {
  return step.stepType === 'reward';
}

export function isThankYouStep(
  step: FormStep,
): step is FormStep & { stepType: 'thank_you'; content: ThankYouContent } {
  return step.stepType === 'thank_you';
}
