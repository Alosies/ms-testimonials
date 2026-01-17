/**
 * Studio Management Actions
 *
 * Actions for managing steps: add, edit, delete.
 * These are domain operations - the "what", not "how" (keyboard vs click).
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';

export function createManagementActions(studio: StudioPage) {
  return {
    // ==========================================
    // Add Operations
    // ==========================================

    /**
     * Add a step and verify count increased
     * @returns The new step count
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

    // ==========================================
    // Edit Operations
    // ==========================================

    /**
     * Edit selected step via E key
     * Opens step editor and verifies correct step is shown
     * @param expectedStepId - Step ID to validate correct step is shown
     */
    async editStep(expectedStepId: string) {
      await studio.pressEditKey();
      await studio.expectStepEditorForStep(expectedStepId);
    },

    // ==========================================
    // Delete Operations
    // ==========================================

    /**
     * Delete selected step via Mod+D and confirm
     * @returns The step count before deletion
     */
    async deleteStepAndConfirm(): Promise<number> {
      const countBefore = await studio.getStepCount();
      await studio.pressDeleteShortcut();
      await studio.expectConfirmationModalVisible();
      await studio.expectConfirmationModalTitle('Delete Step');
      await studio.confirmDelete();
      await studio.expectConfirmationModalHidden();
      return countBefore;
    },

    /**
     * Trigger delete via Mod+D but cancel
     * Verifies modal appears then cancels - step remains
     */
    async deleteStepAndCancel() {
      await studio.pressDeleteShortcut();
      await studio.expectConfirmationModalVisible();
      await studio.cancelDelete();
      await studio.expectConfirmationModalHidden();
    },
  };
}
