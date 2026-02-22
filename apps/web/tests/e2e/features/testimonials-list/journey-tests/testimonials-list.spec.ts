/**
 * Testimonials List Journey Test
 *
 * MVP: Combined journey test covering core testimonials list functionality.
 * Tests table rendering, row selection with detail panel, filter tabs,
 * and search. Uses seeded test data from the E2E test account.
 */
import { test, expect } from '@e2e/app/fixtures';
import { createTestimonialsPage } from '@e2e/shared';

test.describe('Testimonials List', { tag: '@smoke' }, () => {
  test('user can view testimonials table, select rows, and use filters', async ({
    authedPage,
  }) => {
    const testimonialsPage = createTestimonialsPage(authedPage);
    await testimonialsPage.goto();

    // Should see either testimonials table or empty state
    const hasTable = await testimonialsPage.table.isVisible().catch(() => false);
    const hasEmptyState = await testimonialsPage.emptyState.isVisible().catch(() => false);

    expect(hasTable || hasEmptyState).toBeTruthy();

    // If empty state, the rest of the test cannot proceed
    if (hasEmptyState) {
      await expect(testimonialsPage.emptyState).toBeVisible();
      return;
    }

    // --- Table is visible ---
    await testimonialsPage.expectTableVisible();

    // Should have at least one row
    await testimonialsPage.expectRowCountGreaterThan(0);

    // Filter tabs should be visible
    await expect(testimonialsPage.filterTabs).toBeVisible();

    // --- Row selection updates detail panel ---
    // Click the first row
    await testimonialsPage.clickRow(0);

    // Detail panel should show customer name (on lg+ screens)
    const detailVisible = await testimonialsPage.detailCustomerName
      .isVisible()
      .catch(() => false);
    if (detailVisible) {
      // Get the customer name from the first row using test ID
      const firstRowName = await testimonialsPage.getRowCustomerName(0);

      if (firstRowName) {
        await testimonialsPage.expectDetailCustomerName(firstRowName.trim());
      }
    }

    // --- Filter tabs work ---
    // Get initial row count
    const initialCount = await testimonialsPage.tableRows.count();

    // Click "Pending" filter tab using page object method
    const pendingTabVisible = await testimonialsPage.filterTab
      .filter({ has: authedPage.locator('[data-filter-value="pending"]') })
      .isVisible()
      .catch(() => false);
    if (pendingTabVisible) {
      await testimonialsPage.clickFilterTab('pending');
      await testimonialsPage.waitForTableUpdate();

      // Row count should be <= initial (filtered)
      const filteredCount = await testimonialsPage.tableRows.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);

      // Click "All" tab to reset
      await testimonialsPage.clickFilterTab('all');
      await testimonialsPage.waitForTableUpdate();
    }

    // --- Search works ---
    const searchVisible = await testimonialsPage.searchInput.isVisible().catch(() => false);
    if (searchVisible) {
      // Type a search query that's unlikely to match anything
      await testimonialsPage.searchInput.fill('zzz_nonexistent_query_zzz');
      await testimonialsPage.waitForTableUpdate();

      // Should show zero rows or a "no results" message
      const searchRowCount = await testimonialsPage.tableRows.count();
      expect(searchRowCount).toBe(0);

      // Clear search
      await testimonialsPage.searchInput.fill('');
      await testimonialsPage.waitForTableUpdate();

      // Rows should be back
      const restoredCount = await testimonialsPage.tableRows.count();
      expect(restoredCount).toBeGreaterThan(0);
    }
  });
});
