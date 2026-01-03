// Type guards for step type narrowing
export {
  isWelcomeStep,
  isQuestionStep,
  isRatingStep,
  isConsentStep,
  isContactInfoStep,
  isRewardStep,
  isThankYouStep,
} from './typeGuards';

// Default content factories for new steps
export {
  createDefaultWelcomeContent,
  createDefaultThankYouContent,
  createDefaultContactInfoContent,
  createDefaultConsentContent,
  createDefaultRewardContent,
} from './contentFactories';

// Re-export FormContext type (defined in models, used by factories)
export type { FormContext } from '../models/stepContent';

// Step display helpers (labels, icons)
export {
  getStepLabel,
  getStepIcon,
} from './stepHelpers';
