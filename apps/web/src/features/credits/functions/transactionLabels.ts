/**
 * Transaction Type Labels
 *
 * Human-readable labels for credit transaction types.
 * Separated from models/ per FSD guidelines (constants are not types).
 */

import type { TransactionType } from '../models';

/**
 * Human-readable labels for transaction types
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  ai_consumption: 'AI Usage',
  plan_allocation: 'Monthly Credit',
  topup_purchase: 'Credit Purchase',
  promo_bonus: 'Promotional Bonus',
  admin_adjustment: 'Admin Adjustment',
  plan_change_adjustment: 'Plan Change',
  expiration: 'Expired',
};
