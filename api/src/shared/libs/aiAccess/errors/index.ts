// Error Type Definitions
export type {
  AIAccessError,
  AICapabilityDeniedError,
  InsufficientCreditsError,
  DuplicateRequestError,
  RateLimitExceededError,
  AIAccessErrorType,
} from './aiAccessErrors';

// Type Guards
export {
  isAIAccessError,
  isCapabilityDeniedError,
  isInsufficientCreditsError,
  isDuplicateRequestError,
  isRateLimitExceededError,
} from './aiAccessErrors';

// Error Factory Functions
export {
  createCapabilityDeniedError,
  createInsufficientCreditsError,
  createDuplicateRequestError,
  createRateLimitExceededError,
} from './aiAccessErrors';
