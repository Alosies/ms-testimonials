/**
 * AI Access Error Functions
 *
 * Type guards and factory functions for AI access errors.
 * All functions are pure (no side effects).
 *
 * @see types/aiAccessErrors.ts for type definitions
 */

import type {
  AICapabilityId,
  QualityLevelId,
  AICapabilityDenialReason,
  AIAccessError,
  AICapabilityDeniedError,
  InsufficientCreditsError,
  DuplicateRequestError,
  RateLimitExceededError,
  AIAccessErrorType,
} from '../types';

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Checks if an error is an AI access error.
 *
 * @example
 * if (isAIAccessError(error)) {
 *   return c.json({ error: error.message, code: error.code, details: error.details }, 402);
 * }
 */
export function isAIAccessError(error: unknown): error is AIAccessErrorType {
  return (
    typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    typeof (error as AIAccessError)._tag === 'string' &&
    (error as AIAccessError)._tag.endsWith('Error')
  );
}

/** Type guard for AICapabilityDeniedError */
export function isCapabilityDeniedError(
  error: unknown
): error is AICapabilityDeniedError {
  return isAIAccessError(error) && error._tag === 'AICapabilityDeniedError';
}

/** Type guard for InsufficientCreditsError */
export function isInsufficientCreditsError(
  error: unknown
): error is InsufficientCreditsError {
  return isAIAccessError(error) && error._tag === 'InsufficientCreditsError';
}

/** Type guard for DuplicateRequestError */
export function isDuplicateRequestError(
  error: unknown
): error is DuplicateRequestError {
  return isAIAccessError(error) && error._tag === 'DuplicateRequestError';
}

/** Type guard for RateLimitExceededError */
export function isRateLimitExceededError(
  error: unknown
): error is RateLimitExceededError {
  return isAIAccessError(error) && error._tag === 'RateLimitExceededError';
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Creates an AICapabilityDeniedError.
 *
 * This error indicates that the organization's plan does not include access
 * to the requested AI capability, or that access is otherwise restricted.
 *
 * Common denial reasons:
 * - `plan_not_active`: The organization's subscription is inactive
 * - `capability_not_included`: The plan tier doesn't include this feature
 * - `rate_limit_exceeded`: Daily or monthly usage limits reached
 *
 * @example
 * const error = createCapabilityDeniedError(
 *   'testimonial_assembly',
 *   'capability_not_included',
 *   { planName: 'Free', requiredPlan: 'Pro' }
 * );
 */
export function createCapabilityDeniedError(
  capabilityId: AICapabilityId,
  reason: AICapabilityDenialReason,
  additionalDetails?: Record<string, unknown>
): AICapabilityDeniedError {
  return {
    _tag: 'AICapabilityDeniedError',
    code: 'CAPABILITY_DENIED',
    message: `Access to capability '${capabilityId}' denied: ${reason}`,
    capabilityId,
    reason,
    details: { capabilityId, reason, ...additionalDetails },
  };
}

/**
 * Creates an InsufficientCreditsError.
 *
 * This error indicates that the organization does not have enough credits
 * to execute the requested AI operation at the specified quality level.
 * The error includes both the required and available credit amounts to
 * help users understand the shortfall.
 *
 * @example
 * const error = createInsufficientCreditsError(
 *   3.0,  // required
 *   1.5,  // available
 *   'testimonial_assembly',
 *   'enhanced'
 * );
 */
export function createInsufficientCreditsError(
  required: number,
  available: number,
  capabilityId?: AICapabilityId,
  qualityLevelId?: QualityLevelId
): InsufficientCreditsError {
  return {
    _tag: 'InsufficientCreditsError',
    code: 'INSUFFICIENT_CREDITS',
    message: `Insufficient credits: required ${required}, available ${available}`,
    required,
    available,
    capabilityId,
    qualityLevelId,
    details: { required, available, capabilityId, qualityLevelId },
  };
}

/**
 * Creates a DuplicateRequestError.
 *
 * This error is created when a request with the same idempotency key has
 * already been processed. This prevents duplicate credit consumption and
 * duplicate AI operations from accidental retries or network issues.
 *
 * @example
 * const error = createDuplicateRequestError(
 *   'user-123-form-456-2026-01-31',
 *   'txn_abc123'
 * );
 */
export function createDuplicateRequestError(
  idempotencyKey: string,
  existingTransactionId?: string
): DuplicateRequestError {
  return {
    _tag: 'DuplicateRequestError',
    code: 'DUPLICATE_REQUEST',
    message: `Duplicate request detected for key: ${idempotencyKey}`,
    idempotencyKey,
    existingTransactionId,
    details: { idempotencyKey, existingTransactionId },
  };
}

/**
 * Creates a RateLimitExceededError.
 *
 * This error indicates that the organization has exceeded its daily or
 * monthly usage limit for the specified AI capability. Rate limits are
 * configured per-capability in the plan_ai_capabilities junction table.
 *
 * @example
 * const error = createRateLimitExceededError(
 *   'question_generation',
 *   'daily',
 *   100,  // limit
 *   102   // used
 * );
 */
export function createRateLimitExceededError(
  capabilityId: AICapabilityId,
  limitType: 'daily' | 'monthly',
  limit: number,
  used: number
): RateLimitExceededError {
  return {
    _tag: 'RateLimitExceededError',
    code: 'RATE_LIMIT_EXCEEDED',
    message: `Rate limit exceeded for '${capabilityId}': ${used}/${limit} ${limitType}`,
    capabilityId,
    limitType,
    limit,
    used,
    details: { capabilityId, limitType, limit, used },
  };
}
