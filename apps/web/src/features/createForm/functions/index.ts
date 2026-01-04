// Type guards for step type narrowing - re-export from shared
export {
  isWelcomeStep,
  isQuestionStep,
  isRatingStep,
  isConsentStep,
  isContactInfoStep,
  isRewardStep,
  isThankYouStep,
} from '@/shared/stepCards/functions/typeGuards';

// Default content factories for new steps
export {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from './contentFactories';

// Re-export FormContext type from shared
export type { FormContext } from '@/shared/stepCards/models/stepContent';

// Step display helpers (labels, icons)
export {
  getStepLabel,
  getStepIcon,
} from './stepHelpers';
