/**
 * Credits Navigation Actions
 *
 * Actions for navigating to the unified AI Settings page.
 */
import type { CreditsPage } from '@e2e/shared/pages/credits.page';

export function createNavigationActions(credits: CreditsPage, orgSlug: string) {
  return {
    /**
     * Navigate to the unified AI Settings page
     * This page contains credits, rate limits, and usage history.
     */
    async gotoAISettings() {
      await credits.goto(orgSlug);
      await credits.expectBalanceWidgetVisible();
    },

    /**
     * @deprecated Use gotoAISettings() - all AI settings are now on one page
     */
    async gotoLimitsPage() {
      await this.gotoAISettings();
    },

    /**
     * @deprecated Use gotoAISettings() - all AI settings are now on one page
     */
    async gotoUsagePage() {
      await this.gotoAISettings();
    },
  };
}
