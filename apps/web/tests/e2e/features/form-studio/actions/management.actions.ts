/**
 * Studio Management Actions
 *
 * Actions for managing steps (add, delete, reorder).
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';

export function createManagementActions(studio: StudioPage) {
  return {
    /**
     * Add a step and verify count increased
     * Returns the new step count
     */
    async addStep(
      type: 'Welcome' | 'Question' | 'Rating' | 'Consent' | 'Contact Info' | 'Reward' | 'Thank You' = 'Question'
    ): Promise<number> {
      const initialCount = await studio.getStepCount();
      await studio.addStep(type);
      await studio.expectStepCount(initialCount + 1, { timeout: 10000 });
      return initialCount + 1;
    },

    /**
     * Add multiple steps of the same type
     */
    async addSteps(
      count: number,
      type: 'Welcome' | 'Question' | 'Rating' | 'Consent' | 'Contact Info' | 'Reward' | 'Thank You' = 'Question'
    ): Promise<number> {
      let currentCount = await studio.getStepCount();
      for (let i = 0; i < count; i++) {
        await studio.addStep(type);
        currentCount++;
        await studio.expectStepCount(currentCount, { timeout: 10000 });
      }
      return currentCount;
    },
  };
}
