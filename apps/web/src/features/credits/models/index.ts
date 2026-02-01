/**
 * Credit History Models
 *
 * Types for credit transaction history and pagination.
 */

/**
 * Transaction types from the credits system
 */
export type TransactionType =
  | 'ai_consumption'
  | 'plan_allocation'
  | 'topup_purchase'
  | 'promo_bonus'
  | 'admin_adjustment'
  | 'plan_change_adjustment'
  | 'expiration';

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

/**
 * Actor display info extracted from a transaction
 * ADR-023 Decision 8: Audit Log Snapshot Pattern
 */
export interface ActorInfo {
  /** Form name the operation relates to */
  form: string | null;
  /** User email who triggered the operation */
  user: string | null;
}

/**
 * A single credit transaction record
 */
export interface CreditTransaction {
  id: string;
  transactionType: TransactionType;
  creditsAmount: number;
  balanceAfter: number;
  description: string | null;
  aiCapabilityName: string | null;
  qualityLevelName: string | null;
  createdAt: string;
  // Audit context (ADR-023 Decision 8)
  userId: string | null;
  userEmail: string | null;
  formId: string | null;
  formName: string | null;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Response from GET /credits/transactions
 */
export interface CreditTransactionsResponse {
  data: CreditTransaction[];
  pagination: PaginationMeta;
}

/**
 * Query parameters for fetching credit transactions
 */
export interface CreditTransactionsParams {
  page?: number;
  limit?: number;
  transactionType?: TransactionType;
}

// ============================================================
// Credit Topup Package Types
// ============================================================

/**
 * A credit topup package available for purchase
 */
export interface CreditTopupPackage {
  /** Unique package ID */
  id: string;
  /** Unique identifier for the package (e.g., 'starter', 'popular', 'power') */
  uniqueName: string;
  /** Human-readable display name */
  name: string;
  /** Optional description of the package */
  description: string | null;
  /** Number of credits included */
  credits: number;
  /** Price in USD cents (e.g., 999 = $9.99) */
  priceUsdCents: number;
  /** Calculated price per credit */
  pricePerCredit: number;
}

/**
 * Response from GET /credits/topup-packages
 */
export interface GetTopupPackagesResponse {
  packages: CreditTopupPackage[];
}

/**
 * Response from POST /credits/purchase
 */
export interface PurchaseCreditsResponse {
  /** Stripe checkout session URL to redirect the user to */
  checkoutUrl: string;
  /** Stripe checkout session ID for tracking */
  sessionId: string;
}
