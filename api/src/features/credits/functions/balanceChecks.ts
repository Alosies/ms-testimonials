/**
 * Balance Check Functions
 *
 * Pure functions for checking credit balance thresholds.
 * No side effects - input → output only.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

// =============================================================================
// Constants
// =============================================================================

/**
 * Low balance threshold percentage.
 * Notify when balance drops below this percentage of monthly credits.
 */
const LOW_BALANCE_THRESHOLD_PERCENT = 20;

/**
 * Depleted balance threshold in credits.
 * Notify when balance drops to or below this value.
 */
const DEPLETED_BALANCE_THRESHOLD = 1;

/**
 * Exported threshold constants for testing and configuration.
 */
export const THRESHOLDS = {
  LOW_BALANCE_PERCENT: LOW_BALANCE_THRESHOLD_PERCENT,
  DEPLETED_CREDITS: DEPLETED_BALANCE_THRESHOLD,
} as const;

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Checks if balance is considered low (< 20% of monthly allocation).
 *
 * @param balance - Current available credits
 * @param monthlyCredits - Monthly credit allocation from plan
 * @returns true if balance is low
 *
 * @example
 * ```typescript
 * const low = isBalanceLow(15, 100); // true (15% < 20%)
 * const ok = isBalanceLow(25, 100);  // false (25% >= 20%)
 * ```
 */
export function isBalanceLow(balance: number, monthlyCredits: number): boolean {
  // Edge case: if no monthly credits, can't calculate percentage
  if (monthlyCredits <= 0) {
    return false;
  }

  const percentRemaining = (balance / monthlyCredits) * 100;
  return percentRemaining < LOW_BALANCE_THRESHOLD_PERCENT;
}

/**
 * Checks if balance is depleted (very low or negative).
 *
 * @param balance - Current available credits
 * @returns true if balance is depleted
 *
 * @example
 * ```typescript
 * const depleted = isBalanceDepleted(0.5); // true
 * const ok = isBalanceDepleted(5);         // false
 * ```
 */
export function isBalanceDepleted(balance: number): boolean {
  return balance <= DEPLETED_BALANCE_THRESHOLD;
}

/**
 * Determines which threshold was crossed based on balance.
 *
 * @param balance - Current available credits
 * @param monthlyCredits - Monthly credit allocation from plan
 * @returns The threshold that was crossed, or null if balance is healthy
 */
export function determineThreshold(
  balance: number,
  monthlyCredits: number
): 'depleted' | 'low' | null {
  if (isBalanceDepleted(balance)) {
    return 'depleted';
  }
  if (isBalanceLow(balance, monthlyCredits)) {
    return 'low';
  }
  return null;
}

/**
 * Calculates the percentage of monthly credits remaining.
 *
 * @param balance - Current available credits
 * @param monthlyCredits - Monthly credit allocation from plan
 * @returns Percentage remaining (0-100), clamped to 0 minimum
 */
export function computePercentRemaining(
  balance: number,
  monthlyCredits: number
): number {
  if (monthlyCredits <= 0) {
    return 0;
  }
  return Math.max(0, Math.round((balance / monthlyCredits) * 100));
}
