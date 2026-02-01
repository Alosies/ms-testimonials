/**
 * Scheduled Jobs
 *
 * Exports all scheduled job functions for use by external schedulers.
 * These functions are designed to be called by cron jobs, cloud schedulers,
 * or similar time-based triggers.
 *
 * Jobs are designed to be:
 * - Idempotent: Safe to call multiple times
 * - Atomic: Use transactions to prevent partial updates
 * - Independent: Each item processed in isolation (one failure doesn't affect others)
 *
 * @module jobs
 */

// Cleanup expired credit reservations
export {
  cleanupExpiredReservations,
  type CleanupResult,
  type CleanupError,
} from './cleanupReservations';

// Monthly credit reset job for billing period end
export {
  resetMonthlyCredits,
  type ResetMonthlyCreditsResult,
  type OrganizationResetResult,
} from './resetMonthlyCredits';
