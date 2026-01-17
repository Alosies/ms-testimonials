/**
 * Auto-Save Focused Tests - Welcome Step
 *
 * Validates auto-save triggers when editing Welcome step fields.
 * Test flow: edit field → close panel → reload → verify persistence.
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
import { studioTestIds } from '@/shared/constants/testIds';

test.describe('Auto-Save - Welcome Step', () => {
  /**
   * MVP: Combined test for all Welcome step fields (title, subtitle, buttonText).
   * In the future, these should be split into individual atomic tests.
   */
  test('all fields auto-save correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    const welcomeStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'welcome')!;
    const stepCard = studio.getCanvasStepCard(welcomeStep.id);

    // Edit all fields in one session
    await actions.select.selectStep(welcomeStep.id);
    await actions.manage.editStep(welcomeStep.id);

    const newTitle = `Title ${Date.now()}`;
    const newSubtitle = `Subtitle ${Date.now()}`;
    const newButtonText = `Button ${Date.now()}`;

    await actions.autoSave.fillWelcomeField('title', newTitle);
    await actions.autoSave.fillWelcomeField('subtitle', newSubtitle);
    await actions.autoSave.fillWelcomeField('buttonText', newButtonText);

    // Close editor and wait for auto-save once
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify all fields persisted
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    await expect(stepCard.getByTestId(studioTestIds.welcomeTitle)).toContainText(newTitle);
    await expect(stepCard.getByTestId(studioTestIds.welcomeSubtitle)).toContainText(newSubtitle);
    await expect(stepCard.getByTestId(studioTestIds.welcomeButton)).toContainText(newButtonText);
  });
});
