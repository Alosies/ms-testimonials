/**
 * Credits Feature
 *
 * Provides credit balance management and display functionality.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */

// Composables
export { useCreditBalance, useCreditHistory, useAIRateLimits } from './composables';

// Types (exported from models per FSD guidelines)
export type {
  TransactionType,
  ActorInfo,
  CreditTransaction,
  PaginationMeta,
  CreditTransactionsResponse,
  CreditTransactionsParams,
  CreditBalance,
  UseCreditBalanceOptions,
  UseCreditBalanceReturn,
  CreditTopupPackage,
  GetTopupPackagesResponse,
  PurchaseCreditsResponse,
  AICapabilityRateLimit,
  AIRateLimitsResponse,
  UseAIRateLimitsOptions,
  UseAIRateLimitsReturn,
} from './models';

// Functions (constants and pure functions)
export {
  TRANSACTION_TYPE_LABELS,
  getActorInfo,
  hasActorInfo,
  CREDIT_POSITIVE_CLASS,
  CREDIT_NEGATIVE_CLASS,
  getCreditAmountClass,
} from './functions';

// UI Components
export { default as CreditBalanceWidget } from './ui/CreditBalanceWidget.vue';
export { default as AILimitsWidget } from './ui/AILimitsWidget.vue';
export { default as CreditHistoryTable } from './ui/CreditHistoryTable.vue';
export { default as CreditHistoryRow } from './ui/CreditHistoryRow.vue';
export { default as CreditHistoryTableSkeleton } from './ui/CreditHistoryTableSkeleton.vue';
export { default as CreditHistoryEmptyState } from './ui/CreditHistoryEmptyState.vue';
export { default as TopupPurchaseModal } from './ui/TopupPurchaseModal.vue';

// API
export { useApiForCredits } from './api';
