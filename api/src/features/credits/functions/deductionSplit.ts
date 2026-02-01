/**
 * Deduction Split Functions
 *
 * Pure functions for calculating how to split credit deductions
 * between monthly and bonus credits.
 *
 * ADR Reference: ADR-023 AI Capabilities Plan Integration
 */

import type { DeductionSplit } from '../types';

/**
 * Calculates how to split credit deduction between monthly and bonus credits.
 * Deducts from monthly credits first, then bonus credits for any remainder.
 *
 * @param monthlyAvailable - Currently available monthly credits
 * @param bonusAvailable - Currently available bonus credits
 * @param amount - Total amount to deduct
 * @returns Object with monthlyDeducted and bonusDeducted
 *
 * @example
 * ```typescript
 * // Enough monthly credits
 * calculateDeductionSplit(100, 50, 30);
 * // → { monthlyDeducted: 30, bonusDeducted: 0 }
 *
 * // Need to use bonus credits
 * calculateDeductionSplit(10, 50, 30);
 * // → { monthlyDeducted: 10, bonusDeducted: 20 }
 *
 * // All from bonus
 * calculateDeductionSplit(0, 50, 30);
 * // → { monthlyDeducted: 0, bonusDeducted: 30 }
 * ```
 */
export function calculateDeductionSplit(
  monthlyAvailable: number,
  bonusAvailable: number,
  amount: number
): DeductionSplit {
  // Deduct from monthly first (up to what's available)
  const monthlyDeducted = Math.min(monthlyAvailable, amount);
  const remaining = amount - monthlyDeducted;

  // Remainder comes from bonus credits
  const bonusDeducted = Math.min(bonusAvailable, remaining);

  return { monthlyDeducted, bonusDeducted };
}
