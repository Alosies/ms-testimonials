/**
 * Studio Keyboard Shortcuts Tests (Focused)
 *
 * Tests for keyboard shortcuts in the Form Studio:
 * - E key: Opens step editor slide-in for selected step
 * - Mod+D: Shows confirmation modal, deletes step on confirm
 * - F key: Expands current branch flow to full-size view
 * - Escape: Collapses expanded flow back to side-by-side view
 *
 * @see ./actions/management.actions.ts for action helpers
 * @see ./actions/branching.actions.ts for branch expand/collapse helpers
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

  /**
   * F Key - Expand Flow (Branched Forms Only)
   *
   * Tests the F key shortcut for expanding the current branch flow to full-size view.
   * Only works when focused on a step within a branch (testimonial or improvement).
   */
  test.describe('F Key - Expand Flow', () => {
    test('expands current flow when focused on branch step and Escape collapses it', async ({
      authedPage,
      branchedFormViaApi,
    }) => {
      const studio = createStudioPage(authedPage);
      const { branch, setup } = createStudioActions(studio);

      await setup.loadStudio(branchedFormViaApi.studioUrl);

      // Initially should be in side-by-side view (not expanded)
      await studio.expectFlowCollapsed();
      await studio.expectFlowColumnsVisible();

      // Enter the testimonial branch
      await branch.enterBranchArea(branchedFormViaApi);
      await studio.expectFlowFocused('testimonial');

      // Press F to expand the flow
      await branch.expandAndVerifyFlow('testimonial');

      // Verify flow columns are now hidden (expanded view replaces them)
      await expect(studio.getFlowColumn('testimonial')).not.toBeVisible();
      await expect(studio.getFlowColumn('improvement')).not.toBeVisible();

      // Press Escape to collapse back to side-by-side view
      await branch.collapseExpandedFlow();

      // Verify flow columns are visible again
      await studio.expectFlowColumnsVisible();
    });

    test('F key works for improvement branch too', async ({ authedPage, branchedFormViaApi }) => {
      const studio = createStudioPage(authedPage);
      const { branch, setup } = createStudioActions(studio);

      await setup.loadStudio(branchedFormViaApi.studioUrl);

      // Enter branch area and switch to improvement
      await branch.enterBranchArea(branchedFormViaApi);
      await branch.switchToImprovement();
      await studio.expectFlowFocused('improvement');

      // Press F to expand the improvement flow
      await branch.expandAndVerifyFlow('improvement');

      // Collapse and verify
      await branch.collapseExpandedFlow();
      await studio.expectFlowColumnsVisible();
    });

    test('F key does nothing on shared steps (before branch point)', async ({
      authedPage,
      branchedFormViaApi,
    }) => {
      const studio = createStudioPage(authedPage);
      const { select, setup } = createStudioActions(studio);

      await setup.loadStudio(branchedFormViaApi.studioUrl);

      // Select a shared step (welcome step, before the branch point)
      const welcomeStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'welcome');
      expect(welcomeStep).toBeDefined();
      await select.selectStep(welcomeStep!.id);
      await studio.waitForScrollSettle();

      // Verify we're on a shared step (not in a branch)
      await studio.expectFlowCollapsed();

      // Press F - should do nothing since we're not in a branch
      await studio.expandFlow();
      await studio.waitForScrollSettle();

      // Should still be in side-by-side view (not expanded)
      await studio.expectFlowCollapsed();
      await studio.expectFlowColumnsVisible();
    });
  });
});
