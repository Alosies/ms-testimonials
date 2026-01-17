/**
 * Studio Keyboard Shortcuts Tests (Focused)
 *
 * Tests for keyboard shortcuts in the Form Studio:
 * - E key: Opens step editor slide-in for selected step
 * - Mod+D: Shows confirmation modal, deletes step on confirm
 *
 * @see ./actions/management.actions.ts for action helpers
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test.describe('Studio Keyboard Shortcuts', () => {
  test.describe('E Key - Edit Step', () => {
    test('opens step editor for correct step and updates on step change', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const { manage, select, setup } = createStudioActions(studio);

      await setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      // Edit first step - verify correct step ID
      const stepId1 = steps[0].id;
      await select.selectStep(stepId1);
      await manage.editStep(stepId1);

      // Close editor before selecting another step
      await studio.page.keyboard.press('Escape');
      await studio.expectStepEditorHidden();

      // Switch to different step - verify editor opens for new step
      const stepId2 = steps[1].id;
      await select.selectStep(stepId2);
      await manage.editStep(stepId2);
    });
  });

  test.describe('Mod+D - Delete Step', () => {
    test('confirming deletion removes the step', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const { manage, select, setup } = createStudioActions(studio);

      await setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      const initialCount = await studio.getStepCount();
      const stepToDelete = steps[1];
      await select.selectStep(stepToDelete.id);

      // Delete and confirm
      await manage.deleteStepAndConfirm();

      // Verify deletion
      await studio.expectStepCount(initialCount - 1);
      await expect(studio.getSidebarStepCard(stepToDelete.id)).not.toBeVisible();
    });

    test('cancelling deletion keeps the step', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const { manage, select, setup } = createStudioActions(studio);

      await setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      const initialCount = await studio.getStepCount();
      const stepToKeep = steps[1];
      await select.selectStep(stepToKeep.id);

      // Cancel deletion
      await manage.deleteStepAndCancel();

      // Verify step remains
      await studio.expectStepCount(initialCount);
      await expect(studio.getSidebarStepCard(stepToKeep.id)).toBeVisible();
    });
  });
});
