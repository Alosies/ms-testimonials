/**
 * AI Credits Journey Test
 *
 * A comprehensive test that validates all critical AI Credits functionality
 * on the unified AI Settings page (/{org}/settings/ai).
 *
 * The page combines:
 * - AI Credits Card (balance, breakdown, progress bar)
 * - Rate Limits Card (plan limits, status)
 * - Usage History (transaction table, filters)
 *
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * ## What This Test Covers
 * - AI Settings page loads with both cards and history
 * - Credit balance displays valid numbers
 * - Rate limits section shows plan information
 * - Transaction history displays correctly
 * - Filter dropdown and refresh button work
 *
 * ## When to Run
 * - After changes to credits feature
 * - Before merging credits-related PRs
 * - CI pipeline
 *
 * ## If Journey Test Fails
 * Run focused tests to pinpoint the issue:
 * - focused-tests/ai-credits-card.spec.ts - AI Credits card components
 * - focused-tests/ai-rate-limits.spec.ts - Rate Limits card components
 * - focused-tests/ai-usage-history.spec.ts - Usage History section
 */
import { test, expect } from '@e2e/app/fixtures';
import { createCreditsPage } from '@e2e/shared';
import { createCreditsActions } from '@e2e/features/credits/actions';

test.describe('AI Credits', () => {
  test('complete credits journey', { tag: '@smoke' }, async ({ authedPage, orgSlug }) => {
    const credits = createCreditsPage(authedPage);
    const { nav, verify } = createCreditsActions(credits, orgSlug);

    // ========================================================================
    // Part 1: Navigate to unified AI Settings page
    // ========================================================================
    await test.step('1. Navigate to AI Settings page', async () => {
      await nav.gotoAISettings();
    });

    // ========================================================================
    // Part 2: Verify AI Credits Card
    // ========================================================================
    await test.step('2. Verify AI Credits card displays correctly', async () => {
      await credits.expectBalanceWidgetVisible();
    });

    await test.step('3. Verify balance shows valid amount', async () => {
      await verify.verifyBalanceDisplayed();
    });

    // ========================================================================
    // Part 3: Verify Rate Limits Card
    // ========================================================================
    await test.step('4. Verify Rate Limits card displays correctly', async () => {
      await credits.expectRateLimitsSectionVisible();
    });

    await test.step('5. Verify plan name is displayed', async () => {
      await verify.verifyPlanNameDisplayed();
    });

    // ========================================================================
    // Part 4: Verify Usage History Section
    // ========================================================================
    await test.step('6. Verify usage history loads correctly', async () => {
      await verify.verifyUsageHistoryLoaded();
    });

    await test.step('7. Test refresh functionality', async () => {
      // Refresh should work without errors
      await credits.refreshHistory();
      // Wait for data to reload
      await credits.historyTable.or(credits.historyEmpty).waitFor({ timeout: 5000 });
      await verify.verifyUsageHistoryLoaded();
    });

    await test.step('8. Test filter dropdown (if transactions exist)', async () => {
      const hasTransactions = await credits.historyTable.isVisible().catch(() => false);
      if (hasTransactions) {
        // Filter by AI Usage type
        await credits.filterByType('ai_consumption');
        // Verify filter was applied (either shows filtered results or empty state)
        await verify.verifyUsageHistoryLoaded();

        // Reset filter to All Types
        await credits.filterByType('');
        await verify.verifyUsageHistoryLoaded();
      }
    });

    // ========================================================================
    // Part 5: Verify page still works after interactions
    // ========================================================================
    await test.step('9. Verify all sections still visible', async () => {
      await verify.verifyPageLoaded();
      await verify.verifyUsageHistoryLoaded();
    });
  });
});
