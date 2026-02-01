/**
 * Low Balance Notification Types
 *
 * Type definitions for low balance notification operations.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

/**
 * Threshold types for low balance detection.
 */
export type LowBalanceThreshold = 'low' | 'depleted';

/**
 * Event data for low balance notifications.
 * Can be used by email/webhook consumers.
 */
export interface LowBalanceEvent {
  /** Organization ID with low balance */
  organizationId: string;

  /** Current available credits */
  currentBalance: number;

  /** Monthly credit allocation from plan */
  monthlyCredits: number;

  /** Percentage of monthly credits remaining (0-100) */
  percentRemaining: number;

  /** When the current billing period ends */
  periodEndsAt: Date;

  /** Threshold that triggered this event */
  threshold: LowBalanceThreshold;
}

/**
 * Result of processing a low balance notification.
 */
export interface NotificationResult {
  /** Whether notification was sent/logged */
  sent: boolean;

  /** Reason if not sent (e.g., 'debounced', 'not_low') */
  reason?: string;

  /** Event data if notification was processed */
  event?: LowBalanceEvent;
}

/** Row type for credit balance query in notifications */
export type NotificationBalanceRow = {
  monthly_credits: string;
  bonus_credits: string;
  period_end: string;
  available: string;
  [key: string]: unknown;
};
