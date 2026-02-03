/**
 * Test IDs for Credit-related UI components
 *
 * Used by E2E tests for ADR-023 AI Credits Plan Integration.
 *
 * @see docs/adr/023-ai-capabilities-plan-integration/adr.md
 */
export const creditTestIds = {
  // ============================================================================
  // AI Limits Page - Balance Widget
  // ============================================================================
  balanceWidget: 'credit-balance-widget',
  balanceAvailable: 'credit-balance-available',
  balanceUsed: 'credit-balance-used',
  balancePlan: 'credit-balance-plan',
  balanceBonus: 'credit-balance-bonus',
  balanceResetDate: 'credit-balance-reset-date',

  // ============================================================================
  // AI Limits Page - Rate Limits Section
  // ============================================================================
  rateLimitsSection: 'credit-rate-limits-section',
  rateLimitPlanName: 'credit-rate-limit-plan-name',
  rateLimitCapability: 'credit-rate-limit-capability',
  rateLimitHourly: 'credit-rate-limit-hourly',
  rateLimitDaily: 'credit-rate-limit-daily',

  // ============================================================================
  // AI Usage Page - History Table
  // ============================================================================
  historyTable: 'credit-history-table',
  historyFilter: 'credit-history-filter',
  historyRefresh: 'credit-history-refresh',

  // Transaction row elements
  historyRow: 'credit-history-row',
  txDate: 'credit-tx-date',
  txType: 'credit-tx-type',
  txActor: 'credit-tx-actor',
  txCapability: 'credit-tx-capability',
  txAmount: 'credit-tx-amount',
  txBalance: 'credit-tx-balance',

  // Empty state
  historyEmpty: 'credit-history-empty',
} as const;

export type CreditTestId = typeof creditTestIds;
