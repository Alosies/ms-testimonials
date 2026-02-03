/**
 * Credits Page Object
 *
 * Page object for AI Credits functionality. Provides locators and actions
 * for interacting with AI Limits and AI Usage pages.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { Page, expect } from '@playwright/test';
import { creditTestIds } from '@/shared/constants/testIds';

export function createCreditsPage(page: Page) {
  // ============================================================================
  // AI Limits Page Locators
  // ============================================================================
  const balanceWidget = page.getByTestId(creditTestIds.balanceWidget);
  const balanceAvailable = page.getByTestId(creditTestIds.balanceAvailable);
  const balanceUsed = page.getByTestId(creditTestIds.balanceUsed);
  const balancePlan = page.getByTestId(creditTestIds.balancePlan);
  const balanceBonus = page.getByTestId(creditTestIds.balanceBonus);
  const balanceResetDate = page.getByTestId(creditTestIds.balanceResetDate);

  const rateLimitsSection = page.getByTestId(creditTestIds.rateLimitsSection);
  const rateLimitPlanName = page.getByTestId(creditTestIds.rateLimitPlanName);
  const rateLimitCapability = page.getByTestId(creditTestIds.rateLimitCapability);
  const rateLimitHourly = page.getByTestId(creditTestIds.rateLimitHourly);
  const rateLimitDaily = page.getByTestId(creditTestIds.rateLimitDaily);

  // ============================================================================
  // AI Usage Page Locators
  // ============================================================================
  const historyTable = page.getByTestId(creditTestIds.historyTable);
  const historyFilter = page.getByTestId(creditTestIds.historyFilter);
  const historyRefresh = page.getByTestId(creditTestIds.historyRefresh);
  const historyRows = page.getByTestId(creditTestIds.historyRow);
  const historyEmpty = page.getByTestId(creditTestIds.historyEmpty);

  return {
    page,
    // AI Limits locators
    balanceWidget,
    balanceAvailable,
    balanceUsed,
    balancePlan,
    balanceBonus,
    balanceResetDate,
    rateLimitsSection,
    rateLimitPlanName,
    rateLimitCapability,
    rateLimitHourly,
    rateLimitDaily,

    // AI Usage locators
    historyTable,
    historyFilter,
    historyRefresh,
    historyRows,
    historyEmpty,

    // ============================================================================
    // Navigation
    // ============================================================================
    async gotoLimits(orgSlug: string) {
      await page.goto(`/${orgSlug}/settings/limits`);
      await balanceWidget.waitFor({ timeout: 15000 });
    },

    async gotoUsage(orgSlug: string) {
      await page.goto(`/${orgSlug}/settings/credits`);
      // Wait for either table or empty state
      await Promise.race([
        historyTable.waitFor({ timeout: 15000 }),
        historyEmpty.waitFor({ timeout: 15000 }),
      ]).catch(() => {
        // One of them should be visible
      });
    },

    // ============================================================================
    // AI Limits Page Actions
    // ============================================================================
    async expectBalanceWidgetVisible() {
      await expect(balanceWidget).toBeVisible();
    },

    async expectRateLimitsSectionVisible() {
      await expect(rateLimitsSection).toBeVisible();
    },

    async getAvailableCredits(): Promise<number> {
      const text = await balanceAvailable.textContent();
      return parseInt(text?.replace(/,/g, '') ?? '0', 10);
    },

    async getPlanName(): Promise<string> {
      const text = await rateLimitPlanName.textContent();
      return text?.replace(' Plan', '').trim() ?? '';
    },

    async expectCapabilitiesCount(count: number) {
      await expect(rateLimitCapability).toHaveCount(count);
    },

    // ============================================================================
    // AI Usage Page Actions
    // ============================================================================
    async expectHistoryTableVisible() {
      await expect(historyTable).toBeVisible();
    },

    async expectHistoryEmpty() {
      await expect(historyEmpty).toBeVisible();
    },

    async getHistoryRowCount(): Promise<number> {
      return await historyRows.count();
    },

    async filterByType(type: string) {
      await historyFilter.selectOption(type);
    },

    async refreshHistory() {
      await historyRefresh.click();
    },

    async expectHistoryRowCountGreaterThan(count: number) {
      const rowCount = await historyRows.count();
      expect(rowCount).toBeGreaterThan(count);
    },

    /**
     * Get transaction details from a specific row
     */
    async getTransactionDetails(rowIndex: number): Promise<{
      type: string | null;
      amount: string | null;
      actor: string | null;
    }> {
      const row = historyRows.nth(rowIndex);
      const type = await row.getByTestId(creditTestIds.txType).textContent();
      const amount = await row.getByTestId(creditTestIds.txAmount).textContent();
      const actor = await row.getByTestId(creditTestIds.txActor).textContent();
      return { type, amount, actor };
    },

    /**
     * Wait for a new transaction to appear in history
     * Useful after AI operations that consume credits
     */
    async waitForNewTransaction(expectedType?: string) {
      await this.refreshHistory();
      if (expectedType) {
        const row = historyRows.first();
        await expect(row.getByTestId(creditTestIds.txType)).toContainText(expectedType, {
          timeout: 10000,
        });
      } else {
        await expect(historyRows.first()).toBeVisible({ timeout: 10000 });
      }
    },
  };
}

export type CreditsPage = ReturnType<typeof createCreditsPage>;
