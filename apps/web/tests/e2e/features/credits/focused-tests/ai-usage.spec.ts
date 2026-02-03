/**
 * AI Usage Page Focused Tests
 *
 * Detailed tests for the AI Usage (Credit History) page components:
 * - Transaction History Table
 * - Filter Dropdown
 * - Refresh Button
 * - Empty State
 *
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * Run these tests when debugging issues with the AI Usage page.
 */
import { test, expect } from '@e2e/app/fixtures';
import { createCreditsPage } from '@e2e/shared';
import { creditTestIds } from '@/shared/constants/testIds';

test.describe('AI Usage Page', () => {
  test.beforeEach(async ({ authedPage, orgSlug }) => {
    const credits = createCreditsPage(authedPage);
    await credits.gotoUsage(orgSlug);
  });

  test.describe('Page Layout', () => {
    test('loads either table or empty state', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      const hasTable = await credits.historyTable.isVisible().catch(() => false);
      const hasEmpty = await credits.historyEmpty.isVisible().catch(() => false);

      // One of these should be visible
      expect(hasTable || hasEmpty).toBe(true);
    });

    test('filter dropdown is accessible', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      await expect(credits.historyFilter).toBeVisible();
    });

    test('refresh button is accessible', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      await expect(credits.historyRefresh).toBeVisible();
    });
  });

  test.describe('Filter Functionality', () => {
    test('filter dropdown has expected options', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      // Get all option values
      const options = await credits.historyFilter.locator('option').allTextContents();

      // Should have "All Types" option
      expect(options).toContain('All Types');
    });

    test('filter can be changed to AI Usage', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      await credits.filterByType('ai_consumption');

      // Page should still be functional after filter
      const hasTable = await credits.historyTable.isVisible().catch(() => false);
      const hasEmpty = await credits.historyEmpty.isVisible().catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });

    test('filter can be reset to All Types', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      // Apply filter first
      await credits.filterByType('ai_consumption');

      // Reset to all types
      await credits.filterByType('');

      // Page should still be functional
      const hasTable = await credits.historyTable.isVisible().catch(() => false);
      const hasEmpty = await credits.historyEmpty.isVisible().catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });
  });

  test.describe('Refresh Functionality', () => {
    test('refresh button works without error', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      // Click refresh
      await credits.refreshHistory();

      // Wait for any loading to complete
      await authedPage.waitForTimeout(500);

      // Page should still be functional
      const hasTable = await credits.historyTable.isVisible().catch(() => false);
      const hasEmpty = await credits.historyEmpty.isVisible().catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });
  });

  test.describe('Transaction Table (when present)', () => {
    test('transaction rows have required elements', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      const hasTable = await credits.historyTable.isVisible().catch(() => false);
      if (!hasTable) {
        test.skip();
        return;
      }

      const rowCount = await credits.getHistoryRowCount();
      if (rowCount === 0) {
        test.skip();
        return;
      }

      // Check first row has type and amount
      const firstRow = credits.historyRows.first();
      await expect(firstRow.getByTestId(creditTestIds.txType)).toBeVisible();
      await expect(firstRow.getByTestId(creditTestIds.txAmount)).toBeVisible();
    });
  });
});
