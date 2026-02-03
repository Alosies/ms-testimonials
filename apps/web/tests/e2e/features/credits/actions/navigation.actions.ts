/**
 * Credits Navigation Actions
 *
 * Actions for navigating to credit-related pages.
 */
import type { CreditsPage } from '@e2e/shared/pages/credits.page';

export function createNavigationActions(credits: CreditsPage, orgSlug: string) {
  return {
    /**
     * Navigate to AI Limits page and wait for balance widget
     */
    async gotoLimitsPage() {
      await credits.gotoLimits(orgSlug);
      await credits.expectBalanceWidgetVisible();
    },

    /**
     * Navigate to AI Usage page and wait for history
     */
    async gotoUsagePage() {
      await credits.gotoUsage(orgSlug);
    },
  };
}
