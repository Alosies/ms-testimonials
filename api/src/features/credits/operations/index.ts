/**
 * Credits Feature - Impure Operations
 *
 * All operations that interact with the database or external services.
 * These operations may have side effects.
 */

// =============================================================================
// Balance Check Operations
// =============================================================================

export { checkCreditBalance } from './checkBalance';

// =============================================================================
// Reservation Operations
// =============================================================================

export { reserveCredits } from './reserveCredits';

// =============================================================================
// Settlement Operations
// =============================================================================

export { settleCredits } from './settleCredits';

// =============================================================================
// Release Operations
// =============================================================================

export { releaseCredits } from './releaseCredits';

// =============================================================================
// Notification Operations
// =============================================================================

export {
  createLowBalanceEvent,
  processLowBalanceNotification,
  checkAndNotifyLowBalance,
  clearDebounceState,
  THRESHOLDS,
  NOTIFICATION_THRESHOLDS,
} from './notifications';
