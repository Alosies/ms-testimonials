/**
 * Credit Color Classes
 *
 * Centralized Tailwind classes for credit-related UI elements.
 * Ensures consistent styling across AI Limits, AI Usage, and credit displays.
 *
 * Following accounting conventions:
 * - Credits (positive values): Green
 * - Debits (negative values): Red
 */

/**
 * Text color for positive credit values (allocations, bonuses, top-ups)
 */
export const CREDIT_POSITIVE_CLASS = 'text-emerald-600 dark:text-emerald-400';

/**
 * Text color for negative credit values (consumption, usage)
 */
export const CREDIT_NEGATIVE_CLASS = 'text-red-600 dark:text-red-400';

/**
 * Get the appropriate color class based on credit amount
 */
export function getCreditAmountClass(amount: number): string {
  return amount >= 0 ? CREDIT_POSITIVE_CLASS : CREDIT_NEGATIVE_CLASS;
}
