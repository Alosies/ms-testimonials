/**
 * Credits Feature Models
 *
 * Types for credit transactions, balances, and packages.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */

import type { Ref, ComputedRef } from 'vue';
import type { GetBalanceResponse } from '@api/shared/schemas/credits';

// =============================================================================
// Transaction Types
// =============================================================================

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

// =============================================================================
// Credit Balance Types
// =============================================================================

/**
 * Credit balance data structure (from API response)
 */
export type CreditBalance = GetBalanceResponse;

/**
 * Options for useCreditBalance composable
 */
export interface UseCreditBalanceOptions {
  /**
   * Whether to fetch balance automatically on mount.
   * @default true
   */
  autoFetch?: boolean;

  /**
   * Auto-refresh interval in milliseconds.
   * Set to 0 to disable auto-refresh.
   * @default 0
   */
  refreshInterval?: number;
}

/**
 * Return type for useCreditBalance composable
 */
export interface UseCreditBalanceReturn {
  /** Current credit balance data, null if not yet fetched */
  balance: Ref<CreditBalance | null>;

  /** Whether a fetch is currently in progress */
  loading: Ref<boolean>;

  /** Error from the last fetch attempt, null if successful */
  error: Ref<Error | null>;

  /** Fetch the current credit balance from the API */
  fetchBalance: () => Promise<void>;

  /** Alias for fetchBalance */
  refresh: () => Promise<void>;

  /** Percentage of monthly credits used this period (0-100) */
  percentUsed: ComputedRef<number>;

  /** Whether remaining credits are low (< 20% of monthly allocation remaining) */
  isLow: ComputedRef<boolean>;

  /** Number of days until the billing period resets */
  daysUntilReset: ComputedRef<number>;
}

// =============================================================================
// Credit Topup Package Types
// =============================================================================

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
