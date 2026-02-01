/**
 * AI Access Error Type Definitions
 *
 * Type definitions for AI access denial scenarios. These types describe
 * structured error objects about why an AI operation cannot proceed.
 *
 * Error Types:
 * - AICapabilityDeniedError - Capability not available to plan
 * - InsufficientCreditsError - Not enough credits for operation
 * - DuplicateRequestError - Idempotency key already used
 * - RateLimitExceededError - Daily/monthly limit reached
 */

import type { AICapabilityId, QualityLevelId, AICapabilityDenialReason } from './aiCapability';

// =============================================================================
// Base Error Type
// =============================================================================

/** Base structure for all AI access errors */
export interface AIAccessError {
  readonly _tag: string;
  readonly code: string;
  readonly message: string;
  readonly details: Record<string, unknown>;
}

// =============================================================================
// Specific Error Types
// =============================================================================

/** Error when capability access is denied */
export interface AICapabilityDeniedError extends AIAccessError {
  readonly _tag: 'AICapabilityDeniedError';
  readonly code: 'CAPABILITY_DENIED';
  readonly capabilityId: AICapabilityId;
  readonly reason: AICapabilityDenialReason;
}

/** Error when insufficient credits for operation */
export interface InsufficientCreditsError extends AIAccessError {
  readonly _tag: 'InsufficientCreditsError';
  readonly code: 'INSUFFICIENT_CREDITS';
  readonly required: number;
  readonly available: number;
  readonly capabilityId?: AICapabilityId;
  readonly qualityLevelId?: QualityLevelId;
}

/** Error when duplicate operation is detected (idempotency check) */
export interface DuplicateRequestError extends AIAccessError {
  readonly _tag: 'DuplicateRequestError';
  readonly code: 'DUPLICATE_REQUEST';
  readonly idempotencyKey: string;
  readonly existingTransactionId?: string;
}

/** Error when rate limit is exceeded */
export interface RateLimitExceededError extends AIAccessError {
  readonly _tag: 'RateLimitExceededError';
  readonly code: 'RATE_LIMIT_EXCEEDED';
  readonly capabilityId: AICapabilityId;
  readonly limitType: 'daily' | 'monthly';
  readonly limit: number;
  readonly used: number;
}

// =============================================================================
// Union Type
// =============================================================================

/** Union of all AI access error types */
export type AIAccessErrorType =
  | AICapabilityDeniedError
  | InsufficientCreditsError
  | DuplicateRequestError
  | RateLimitExceededError;
