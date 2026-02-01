// =============================================================================
// Error Types (re-exported from types/)
// =============================================================================

export type {
  AIAccessError,
  AICapabilityDeniedError,
  InsufficientCreditsError,
  DuplicateRequestError,
  RateLimitExceededError,
  AIAccessErrorType,
} from '../types';

// =============================================================================
// Type Guards (pure functions)
// =============================================================================

export {
  isAIAccessError,
  isCapabilityDeniedError,
  isInsufficientCreditsError,
  isDuplicateRequestError,
  isRateLimitExceededError,
} from './aiAccessErrors';

// =============================================================================
// Factory Functions (pure functions)
// =============================================================================

export {
  createCapabilityDeniedError,
  createInsufficientCreditsError,
  createDuplicateRequestError,
  createRateLimitExceededError,
} from './aiAccessErrors';
