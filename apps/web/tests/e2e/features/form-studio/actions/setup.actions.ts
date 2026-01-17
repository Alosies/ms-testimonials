/**
 * Studio Setup Actions
 *
 * Actions for loading and initializing the studio.
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestFormData } from '@e2e/entities/form/types';

export function createSetupActions(studio: StudioPage) {
  return {
    /**
     * Load studio and wait for it to be ready
     */
    async loadStudio(studioUrl: string) {
      await studio.page.goto(studioUrl);
      await studio.expectLoaded();
    },

    /**
     * Load studio and verify step count matches form data
     */
    async loadWithSteps(formData: TestFormData) {
      await studio.page.goto(formData.studioUrl);
      await studio.expectLoaded();

      const expectedCount = formData.steps?.length ?? 0;
      if (expectedCount > 0) {
        await studio.expectStepCount(expectedCount, { timeout: 10000 });
      }
    },
  };
}
