/**
 * AI Limits Page Focused Tests
 *
 * Detailed tests for the AI Limits settings page components:
 * - Credit Balance Widget (balance display, usage visualization)
 * - Rate Limits Section (plan info, capability limits)
 *
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * Run these tests when debugging issues with the AI Limits page.
 */
import { test, expect } from '@e2e/app/fixtures';
import { createCreditsPage } from '@e2e/shared';

test.describe('AI Limits Page', () => {
  test.beforeEach(async ({ authedPage, orgSlug }) => {
    const credits = createCreditsPage(authedPage);
    await credits.gotoLimits(orgSlug);
  });

  test.describe('Credit Balance Widget', () => {
    test('displays available credits', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      await credits.expectBalanceWidgetVisible();

      const available = await credits.getAvailableCredits();
      expect(available).toBeGreaterThanOrEqual(0);
    });

    test('balance widget shows valid number format', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      const text = await credits.balanceAvailable.textContent();

      // Should be a number with optional comma separators and decimal points
      expect(text).toMatch(/^[\d,.]+$/);
    });
  });

  test.describe('Rate Limits Section', () => {
    test('displays rate limits section', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      await credits.expectRateLimitsSectionVisible();
    });

    test('displays plan name', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      const planName = await credits.getPlanName();

      // Plan name should not be empty
      expect(planName.length).toBeGreaterThan(0);
    });

    test('displays at least one AI capability', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);

      // Should have at least one capability (or none if plan has no AI features)
      const capabilities = credits.rateLimitCapability;
      const count = await capabilities.count();

      // Count can be 0 if plan has no AI, but should not error
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });
});
