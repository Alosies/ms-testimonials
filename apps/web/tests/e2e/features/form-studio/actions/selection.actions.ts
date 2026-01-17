/**
 * Studio Selection Actions
 *
 * Actions for selecting steps in the studio.
 */
import { expect } from '@playwright/test';
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestStep } from '@e2e/entities/form/types';

export function createSelectionActions(studio: StudioPage) {
  return {
    /**
     * Select a step by ID and verify selection
     */
    async selectStep(stepId: string) {
      await studio.selectStepById(stepId);
      await studio.waitForScrollSettle();
      await studio.expectSidebarStepSelected(stepId);
    },

    /**
     * Select a step by index
     */
    async selectStepByIndex(index: number) {
      await studio.selectStep(index);
      await studio.waitForScrollSettle();
    },

    /**
     * Click through all steps in order
     */
    async clickThroughSteps(steps: TestStep[]) {
      for (const step of steps) {
        await studio.selectStepById(step.id);
        await studio.waitForScrollSettle();
        await studio.expectSidebarStepSelected(step.id);
      }
    },

    /**
     * Click through steps: first, last, middle
     */
    async clickFirstLastMiddle(steps: TestStep[]) {
      expect(steps.length).toBeGreaterThanOrEqual(3);

      const first = steps[0];
      const last = steps[steps.length - 1];
      const middle = steps[Math.floor(steps.length / 2)];

      await this.selectStep(first.id);
      await this.selectStep(last.id);
      await this.selectStep(middle.id);
    },
  };
}
