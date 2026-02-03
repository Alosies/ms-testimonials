/**
 * AI Credits Journey Test
 *
 * A comprehensive test that validates all critical AI Credits functionality
 * in one continuous flow. Covers AI Limits page (balance + rate limits) and
 * AI Usage page (transaction history).
 *
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * ## What This Test Covers
 * - AI Limits page loads with balance widget and rate limits section
 * - Credit balance displays valid numbers
 * - Plan name is shown in rate limits section
 * - AI Usage page loads with transaction history or empty state
 * - Filter dropdown and refresh button work
 *
 * ## When to Run
 * - After changes to credits feature
 * - Before merging credits-related PRs
 * - CI pipeline
 *
 * ## If Journey Test Fails
 * Run focused tests to pinpoint the issue:
 * - focused-tests/ai-limits.spec.ts - AI Limits page components
 * - focused-tests/ai-usage.spec.ts - AI Usage page components
 */
import { test, expect } from '@e2e/app/fixtures';
import { createCreditsPage } from '@e2e/shared';
import { createCreditsActions } from '@e2e/features/credits/actions';

test.describe('AI Credits', () => {
  test('complete credits journey', { tag: '@smoke' }, async ({ authedPage, orgSlug }) => {
    const credits = createCreditsPage(authedPage);
    const { nav, verify } = createCreditsActions(credits, orgSlug);

    // ========================================================================
    // Part 1: AI Limits Page
    // ========================================================================
    await test.step('1. Navigate to AI Limits page', async () => {
      await nav.gotoLimitsPage();
    });

    await test.step('2. Verify balance widget displays correctly', async () => {
      await verify.verifyBalanceDisplayed();
    });

    await test.step('3. Verify rate limits section displays correctly', async () => {
      await credits.expectRateLimitsSectionVisible();
    });

    await test.step('4. Verify plan name is displayed', async () => {
      await verify.verifyPlanNameDisplayed();
    });

    // ========================================================================
    // Part 2: AI Usage Page
    // ========================================================================
    await test.step('5. Navigate to AI Usage page', async () => {
      await nav.gotoUsagePage();
    });

    await test.step('6. Verify usage page loads correctly', async () => {
      await verify.verifyUsagePageLoaded();
    });

    await test.step('7. Test refresh functionality', async () => {
      // Refresh should work without errors
      await credits.refreshHistory();
      // Small wait for refresh to complete
      await authedPage.waitForTimeout(500);
      await verify.verifyUsagePageLoaded();
    });

    await test.step('8. Test filter dropdown (if transactions exist)', async () => {
      const hasTransactions = await credits.historyTable.isVisible().catch(() => false);
      if (hasTransactions) {
        // Filter by AI Usage type
        await credits.filterByType('ai_consumption');
        // Verify filter was applied (either shows filtered results or empty state)
        await verify.verifyUsagePageLoaded();

        // Reset filter to All Types
        await credits.filterByType('');
        await verify.verifyUsagePageLoaded();
      }
    });

    // ========================================================================
    // Part 3: Verify navigation between pages works
    // ========================================================================
    await test.step('9. Navigate back to AI Limits', async () => {
      await nav.gotoLimitsPage();
      await verify.verifyLimitsPageLoaded();
    });
  });
});
