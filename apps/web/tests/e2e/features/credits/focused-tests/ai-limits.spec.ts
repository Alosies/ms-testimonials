/**
 * AI Settings Page Focused Tests - Cards Section
 *
 * Detailed tests for the AI Credits and Rate Limits cards on the
 * unified AI Settings page (/{org}/settings/ai).
 *
 * Part of ADR-023 AI Capabilities Plan Integration.
 *
 * Run these tests when debugging issues with the cards display.
 */
import { test, expect } from '@e2e/app/fixtures';
import { createCreditsPage } from '@e2e/shared';

test.describe('AI Settings Page - Cards', () => {
  test.beforeEach(async ({ authedPage, orgSlug }) => {
    const credits = createCreditsPage(authedPage);
    await credits.goto(orgSlug);
  });

  test.describe('AI Credits Card', () => {
    test('displays available credits', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      await credits.expectBalanceWidgetVisible();

      const available = await credits.getAvailableCredits();
      expect(available).toBeGreaterThanOrEqual(0);
    });

    test('balance shows valid number format', async ({ authedPage }) => {
      const credits = createCreditsPage(authedPage);
      const text = await credits.balanceAvailable.textContent();

      // Should be a number with optional comma separators and decimal points
      expect(text).toMatch(/^[\d,.]+$/);
    });
  });

  test.describe('Rate Limits Card', () => {
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
  });
});
