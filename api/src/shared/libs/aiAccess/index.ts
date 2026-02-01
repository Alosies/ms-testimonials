/**
 * AI Access Library
 *
 * Shared library for AI capability access control and credit management.
 * Use these utilities to check if an organization can execute AI operations
 * and to manage the AI operation lifecycle.
 *
 * Primary Workflow:
 * 1. checkAIAccess() - Verify capability access + credit balance
 * 2. reserveCredits() - Reserve credits before operation (from credits feature)
 * 3. Execute AI operation
 * 4. settleCredits() or releaseCredits() - Finalize (from credits feature)
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

// =============================================================================
// Operations (impure - database, API, I/O)
// =============================================================================

export { checkCapabilityAccess } from './operations';
export { checkAIAccess, type CheckAIAccessParams } from './operations';
export {
  executeWithAIAccess,
  type ExecuteWithAIAccessParams,
  type AIExecutionContext,
  type AIOperationResult,
  type AIExecutionError,
  type AIExecutionResult,
} from './operations';

// =============================================================================
// Types - AI Capability Identifiers
// =============================================================================

export type {
  AICapabilityId,
  QualityLevelId,
} from './types';

// =============================================================================
// Types - Quality Level Information
// =============================================================================

export type { QualityLevelInfo } from './types';

// =============================================================================
// Types - Access Check Results
// =============================================================================

export type {
  AICapabilityDenialReason,
  AICapabilityAccessResult,
  AIAccessDenialReason,
  AIAccessResult,
} from './types';

// =============================================================================
// Types - Credit Transaction & Reservation
// =============================================================================

export type {
  CreditTransactionType,
  CreditReservationStatus,
} from './types';

// =============================================================================
// Types - LLM Provider
// =============================================================================

export type {
  LLMProvider,
  LLMQualityTier,
} from './types';

// =============================================================================
// Error Types
// =============================================================================

export type {
  AIAccessError,
  AICapabilityDeniedError,
  InsufficientCreditsError,
  DuplicateRequestError,
  RateLimitExceededError,
  AIAccessErrorType,
} from './errors';

// =============================================================================
// Error Type Guards
// =============================================================================

export {
  isAIAccessError,
  isCapabilityDeniedError,
  isInsufficientCreditsError,
  isDuplicateRequestError,
  isRateLimitExceededError,
} from './errors';

// =============================================================================
// Error Factory Functions
// =============================================================================

export {
  createCapabilityDeniedError,
  createInsufficientCreditsError,
  createDuplicateRequestError,
  createRateLimitExceededError,
} from './errors';
