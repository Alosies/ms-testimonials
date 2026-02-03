/**
 * Credits Verification Actions
 *
 * Actions for verifying credit balance and history state.
 */
import { expect } from '@playwright/test';
import type { CreditsPage } from '@e2e/shared/pages/credits.page';

export function createVerificationActions(credits: CreditsPage) {
  return {
    /**
     * Verify AI Limits page displays correctly
     */
    async verifyLimitsPageLoaded() {
      await credits.expectBalanceWidgetVisible();
      await credits.expectRateLimitsSectionVisible();
    },

    /**
     * Verify balance widget shows valid credit amount
     */
    async verifyBalanceDisplayed() {
      const available = await credits.getAvailableCredits();
      expect(available).toBeGreaterThanOrEqual(0);
    },

    /**
     * Verify plan name is displayed in rate limits section
     */
    async verifyPlanNameDisplayed() {
      const planName = await credits.getPlanName();
      expect(planName.length).toBeGreaterThan(0);
    },

    /**
     * Verify AI Usage page displays correctly
     */
    async verifyUsagePageLoaded() {
      // Either table or empty state should be visible
      const hasTable = await credits.historyTable.isVisible().catch(() => false);
      const hasEmpty = await credits.historyEmpty.isVisible().catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    },

    /**
     * Verify history table has transactions
     */
    async verifyHistoryHasTransactions() {
      await credits.expectHistoryTableVisible();
      await credits.expectHistoryRowCountGreaterThan(0);
    },

    /**
     * Verify a transaction appeared with expected type
     */
    async verifyTransactionExists(expectedType: string) {
      await credits.expectHistoryTableVisible();
      const rowCount = await credits.getHistoryRowCount();
      let found = false;

      for (let i = 0; i < rowCount; i++) {
        const details = await credits.getTransactionDetails(i);
        if (details.type?.includes(expectedType)) {
          found = true;
          break;
        }
      }

      expect(found).toBe(true);
    },
  };
}
