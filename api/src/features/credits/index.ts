/**
 * Credits Feature - Public API
 *
 * This module exports all public functions and types for credit management.
 * Implements the two-phase commit pattern for AI operation billing:
 * 1. Reserve credits before operation
 * 2. Settle (consume) or Release (refund) after operation
 *
 * ## Data Access Strategy
 *
 * This feature uses a hybrid approach for data access:
 *
 * **GraphQL (via Hasura)** - Used for READ operations:
 * - `checkCreditBalance` - Reading balance for eligibility checks
 * - Route handlers for GET /credits/balance, GET /credits/transactions
 * - Benefits: Type-safe via codegen, Hasura RLS for org isolation,
 *   consistent with frontend data patterns
 *
 * **Drizzle/SQL** - Used for WRITE operations:
 * - `reserveCredits` - Atomic reservation with conditional updates
 * - `settleCredits` - Transaction with deduction split calculation
 * - `releaseCredits` - Atomic status update with credit restoration
 * - Benefits: Multi-table transactions, conditional updates,
 *   optimistic locking patterns, complex aggregations
 *
 * ## Decision Rationale
 *
 * The two-phase commit pattern (reserve → settle/release) requires
 * transactional guarantees that are better expressed with direct SQL:
 * - Conditional updates: `WHERE reserved_credits >= $amount`
 * - Multi-table atomicity: balance + reservation in single transaction
 * - Complex aggregations: sum of settled vs bonus credits
 *
 * Read operations benefit from GraphQL:
 * - Generated types ensure frontend/backend consistency
 * - Hasura computed fields reduce duplication (available_credits, spendable_credits, used_this_period)
 * - Joins are handled declaratively
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

// =============================================================================
// Types
// =============================================================================

export type {
  // Balance types
  CreditBalanceCheck,
  // Reservation types
  ReserveCreditParams,
  CreditReservation,
  // Settlement types
  SettleCreditParams,
  CreditSettlement,
  InvalidReservationStatusError,
  SettlementReservationNotFoundError,
  // Release types
  ReleaseCreditParams,
  CreditRelease,
  ReservationSettledError,
  ReleaseReservationNotFoundError,
  // Notification types
  LowBalanceEvent,
  LowBalanceThreshold,
  NotificationResult,
} from './types';

// =============================================================================
// Operations (Impure - DB, API, I/O)
// =============================================================================

export { checkCreditBalance } from './operations';
export { reserveCredits } from './operations';
export { settleCredits } from './operations';
export { releaseCredits } from './operations';

// =============================================================================
// Notification Operations
// =============================================================================

export {
  createLowBalanceEvent,
  processLowBalanceNotification,
  checkAndNotifyLowBalance,
  clearDebounceState,
} from './operations';

// =============================================================================
// Functions (Pure - no side effects)
// =============================================================================

export {
  // Balance checks
  isBalanceLow,
  isBalanceDepleted,
  determineThreshold,
  computePercentRemaining,
  // Deduction calculation
  calculateDeductionSplit,
  // Metadata building
  buildProviderMetadata,
  // Error factories & type guards
  createInvalidReservationStatusError,
  createSettlementReservationNotFoundError,
  isInvalidReservationStatusError,
  isSettlementReservationNotFoundError,
  createReservationSettledError,
  createReleaseReservationNotFoundError,
  isReservationSettledError,
  isReleaseReservationNotFoundError,
  // Constants
  THRESHOLDS,
} from './functions';

// =============================================================================
// Legacy Exports (for backwards compatibility during migration)
// =============================================================================

// Re-export with old names for any code that hasn't migrated yet
export {
  isSettlementReservationNotFoundError as isReservationNotFoundError,
} from './functions';
