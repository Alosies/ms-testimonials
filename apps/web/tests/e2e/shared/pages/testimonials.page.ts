/**
 * Testimonials Page Object
 *
 * Page object for the testimonials list page. Provides locators and actions
 * for interacting with the testimonials table UI.
 */
import { Page, expect } from '@playwright/test';
import { testimonialsTestIds } from '@/shared/constants/testIds';

export function createTestimonialsPage(page: Page) {
  const table = page.getByTestId(testimonialsTestIds.testimonialsTable);
  const tableRows = page.getByTestId(testimonialsTestIds.testimonialsTableRow);
  const emptyState = page.getByTestId(testimonialsTestIds.testimonialsEmptyState);
  const filterTabs = page.getByTestId(testimonialsTestIds.filterTabs);
  const filterTab = page.getByTestId(testimonialsTestIds.filterTab);
  const searchInput = page.getByTestId(testimonialsTestIds.searchInput);
  const detailPanel = page.getByTestId(testimonialsTestIds.detailPanel);
  const detailCustomerName = page.getByTestId(testimonialsTestIds.detailCustomerName);
  const detailContent = page.getByTestId(testimonialsTestIds.detailContent);
  const detailStatus = page.getByTestId(testimonialsTestIds.detailStatus);
  const approveButton = page.getByTestId(testimonialsTestIds.approveButton);
  const rejectButton = page.getByTestId(testimonialsTestIds.rejectButton);
  const tableSkeleton = page.getByTestId(testimonialsTestIds.tableSkeleton);

  return {
    page,
    table,
    tableRows,
    emptyState,
    filterTabs,
    filterTab,
    searchInput,
    detailPanel,
    detailCustomerName,
    detailContent,
    detailStatus,
    approveButton,
    rejectButton,
    tableSkeleton,

    async goto() {
      // Click Testimonials nav item in sidebar (using testid to avoid strict mode issues)
      await page.getByTestId('nav-testimonials').click();
      // Wait for either table or empty state
      await Promise.race([
        table.waitFor({ timeout: 15000 }),
        emptyState.waitFor({ timeout: 15000 }),
      ]).catch(() => {
        // One of them should be visible
      });
    },

    async expectTableVisible() {
      await expect(table).toBeVisible();
    },

    async expectRowCount(count: number) {
      await expect(tableRows).toHaveCount(count);
    },

    async expectRowCountGreaterThan(min: number) {
      const count = await tableRows.count();
      expect(count).toBeGreaterThan(min);
    },

    async clickRow(index: number) {
      await tableRows.nth(index).click();
    },

    /** Get the customer name text from a row by index */
    async getRowCustomerName(index: number): Promise<string> {
      const nameEl = tableRows.nth(index).getByTestId(testimonialsTestIds.rowCustomerName);
      return (await nameEl.textContent()) ?? '';
    },

    async clickFilterTab(value: string) {
      await filterTab.filter({ has: page.locator(`[data-filter-value="${value}"]`) }).click();
    },

    async expectDetailPanelVisible() {
      await expect(detailPanel).toBeVisible();
    },

    async expectDetailCustomerName(name: string) {
      await expect(detailCustomerName).toHaveText(name);
    },

    /** Wait for the table rows to settle after filtering/searching */
    async waitForTableUpdate() {
      await page.waitForLoadState('networkidle');
    },
  };
}

export type TestimonialsPage = ReturnType<typeof createTestimonialsPage>;
