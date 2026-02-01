/**
 * Low Balance Notifications Operation
 *
 * Detects and notifies organizations about low credit balance.
 * Implements debounce logic to prevent notification spam.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration (T7.7)
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  isBalanceLow,
  isBalanceDepleted,
  computePercentRemaining,
  determineThreshold,
  THRESHOLDS,
} from '../functions';
import type {
  LowBalanceEvent,
  LowBalanceThreshold,
  NotificationResult,
  NotificationBalanceRow,
} from '../types';

// =============================================================================
// Constants
// =============================================================================

/**
 * Debounce window in milliseconds.
 * Only send one notification per org within this window.
 */
const NOTIFICATION_DEBOUNCE_MS = 24 * 60 * 60 * 1000; // 24 hours

// =============================================================================
// In-Memory Debounce Store
// =============================================================================

/**
 * In-memory store for tracking last notification time per organization.
 * Key: `${organizationId}:${threshold}` to track per-threshold debounce.
 *
 * Note: This is intentionally in-memory for simplicity. In a multi-instance
 * deployment, consider using Redis or a database table instead.
 */
const lastNotificationTime = new Map<string, number>();

/**
 * Gets the debounce key for an organization and threshold.
 */
function getDebounceKey(organizationId: string, threshold: LowBalanceThreshold): string {
  return `${organizationId}:${threshold}`;
}

/**
 * Checks if a notification should be debounced.
 * @returns true if notification should be skipped (debounced)
 */
function shouldDebounce(organizationId: string, threshold: LowBalanceThreshold): boolean {
  const key = getDebounceKey(organizationId, threshold);
  const lastTime = lastNotificationTime.get(key);

  if (!lastTime) {
    return false;
  }

  return Date.now() - lastTime < NOTIFICATION_DEBOUNCE_MS;
}

/**
 * Records that a notification was sent for debounce tracking.
 */
function recordNotification(organizationId: string, threshold: LowBalanceThreshold): void {
  const key = getDebounceKey(organizationId, threshold);
  lastNotificationTime.set(key, Date.now());
}

/**
 * Clears debounce state for an organization.
 * Useful for testing or when balance is replenished.
 */
export function clearDebounceState(organizationId?: string): void {
  if (organizationId) {
    // Clear all thresholds for this org
    lastNotificationTime.delete(getDebounceKey(organizationId, 'low'));
    lastNotificationTime.delete(getDebounceKey(organizationId, 'depleted'));
  } else {
    // Clear all state
    lastNotificationTime.clear();
  }
}

// =============================================================================
// Event Creation
// =============================================================================

/**
 * Creates a low balance event for an organization if balance is low.
 * Returns null if balance is not low or organization not found.
 *
 * @param organizationId - The organization to check
 * @returns LowBalanceEvent if balance is low, null otherwise
 *
 * @example
 * ```typescript
 * const event = await createLowBalanceEvent('org_123');
 * if (event) {
 *   console.log(`Balance is ${event.percentRemaining}% of monthly`);
 * }
 * ```
 */
export async function createLowBalanceEvent(
  organizationId: string
): Promise<LowBalanceEvent | null> {
  const db = getDb();

  // Query balance information
  const result = await db.execute<NotificationBalanceRow>(sql`
    SELECT
      ocb.monthly_credits::text,
      ocb.bonus_credits::text,
      ocb.period_end::text,
      get_available_credits(${organizationId})::text as available
    FROM organization_credit_balances ocb
    WHERE ocb.organization_id = ${organizationId}
  `);

  // Organization not found
  if (!result || result.length === 0) {
    return null;
  }

  const row = result[0];
  const monthlyCredits = parseFloat(row.monthly_credits) || 0;
  const currentBalance = parseFloat(row.available) || 0;
  const periodEndsAt = new Date(row.period_end);

  // Determine which threshold was crossed (if any) using pure function
  const threshold = determineThreshold(currentBalance, monthlyCredits);

  // Balance is not low
  if (!threshold) {
    return null;
  }

  // Calculate percentage remaining using pure function
  const percentRemaining = computePercentRemaining(currentBalance, monthlyCredits);

  return {
    organizationId,
    currentBalance,
    monthlyCredits,
    percentRemaining,
    periodEndsAt,
    threshold,
  };
}

// =============================================================================
// Notification Processing
// =============================================================================

/**
 * Processes a low balance notification event.
 * Applies debounce logic and logs the notification.
 *
 * Currently logs to console. In the future, this can be extended to:
 * - Send email notifications
 * - Emit to an event bus
 * - Create in-app notifications
 * - Trigger webhooks
 *
 * @param event - The low balance event to process
 * @returns NotificationResult indicating whether notification was sent
 *
 * @example
 * ```typescript
 * const event = await createLowBalanceEvent('org_123');
 * if (event) {
 *   const result = await processLowBalanceNotification(event);
 *   if (result.sent) {
 *     console.log('Notification sent');
 *   }
 * }
 * ```
 */
export async function processLowBalanceNotification(
  event: LowBalanceEvent
): Promise<NotificationResult> {
  const { organizationId, threshold } = event;

  // Check debounce - only one notification per day per org per threshold
  if (shouldDebounce(organizationId, threshold)) {
    return {
      sent: false,
      reason: 'debounced',
    };
  }

  // Log the notification (placeholder for actual notification sending)
  const message = threshold === 'depleted'
    ? `[CREDIT ALERT] Organization ${organizationId}: Credits DEPLETED (${event.currentBalance} credits remaining)`
    : `[CREDIT ALERT] Organization ${organizationId}: Low balance warning (${event.percentRemaining}% of monthly credits remaining, ${event.currentBalance}/${event.monthlyCredits})`;

  console.log(message);
  console.log(`  Period ends: ${event.periodEndsAt.toISOString()}`);

  // Record notification for debounce
  recordNotification(organizationId, threshold);

  return {
    sent: true,
    event,
  };
}

// =============================================================================
// Integration Helper
// =============================================================================

/**
 * Checks and processes low balance notification for an organization.
 * Convenience function that combines createLowBalanceEvent and processLowBalanceNotification.
 *
 * Call this after settleCredits completes to check if balance crossed threshold.
 *
 * @param organizationId - The organization to check
 * @returns NotificationResult indicating outcome
 *
 * @example
 * ```typescript
 * // After settling credits
 * const settlement = await settleCredits({ ... });
 *
 * // Check if we should notify about low balance
 * const notificationResult = await checkAndNotifyLowBalance(organizationId);
 * ```
 */
export async function checkAndNotifyLowBalance(
  organizationId: string
): Promise<NotificationResult> {
  const event = await createLowBalanceEvent(organizationId);

  if (!event) {
    return {
      sent: false,
      reason: 'not_low',
    };
  }

  return processLowBalanceNotification(event);
}

// =============================================================================
// Re-export Constants (for testing and external use)
// =============================================================================

export { THRESHOLDS };

// Add debounce to exported thresholds
export const NOTIFICATION_THRESHOLDS = {
  ...THRESHOLDS,
  DEBOUNCE_MS: NOTIFICATION_DEBOUNCE_MS,
} as const;
