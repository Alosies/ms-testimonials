/**
 * Credits Feature - Pure Functions
 *
 * All pure functions for credit management operations.
 * No side effects - input → output only.
 */

// =============================================================================
// Balance Check Functions
// =============================================================================

export {
  isBalanceLow,
  isBalanceDepleted,
  determineThreshold,
  computePercentRemaining,
  THRESHOLDS,
} from './balanceChecks';

// =============================================================================
// Deduction Split Functions
// =============================================================================

export { calculateDeductionSplit } from './deductionSplit';

// =============================================================================
// Provider Metadata Functions
// =============================================================================

export { buildProviderMetadata } from './providerMetadata';

// =============================================================================
// Error Factory Functions & Type Guards
// =============================================================================

export {
  // Settlement errors
  createInvalidReservationStatusError,
  createSettlementReservationNotFoundError,
  isInvalidReservationStatusError,
  isSettlementReservationNotFoundError,
  // Release errors
  createReservationSettledError,
  createReleaseReservationNotFoundError,
  isReservationSettledError,
  isReleaseReservationNotFoundError,
} from './errorFactories';
