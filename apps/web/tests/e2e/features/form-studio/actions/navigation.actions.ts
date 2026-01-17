/**
 * Studio Navigation Actions
 *
 * Actions for keyboard navigation (up/down) in the studio.
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';

export function createNavigationActions(studio: StudioPage) {
  return {
    /**
     * Navigate down to next step
     */
    async navigateDown(expectedStepId?: string) {
      await studio.navigateDown();
      await studio.waitForScrollSettle();
      if (expectedStepId) {
        await studio.expectSidebarStepSelected(expectedStepId);
      }
    },

    /**
     * Navigate up to previous step
     */
    async navigateUp(expectedStepId?: string) {
      await studio.navigateUp();
      await studio.waitForScrollSettle();
      if (expectedStepId) {
        await studio.expectSidebarStepSelected(expectedStepId);
      }
    },

    /**
     * Navigate down through N steps
     */
    async navigateDownSteps(count: number, finalStepId?: string) {
      for (let i = 0; i < count; i++) {
        await studio.navigateDown();
        await studio.waitForScrollSettle(200);
      }
      if (finalStepId) {
        await studio.expectSidebarStepSelected(finalStepId);
      }
    },

    /**
     * Navigate up through N steps
     */
    async navigateUpSteps(count: number, finalStepId?: string) {
      for (let i = 0; i < count; i++) {
        await studio.navigateUp();
        await studio.waitForScrollSettle(200);
      }
      if (finalStepId) {
        await studio.expectSidebarStepSelected(finalStepId);
      }
    },
  };
}
