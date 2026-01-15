/**
 * Form Studio Tests
 *
 * Tests for the form builder/studio functionality.
 */
import { test, expect } from '../../entities/form/fixtures';
import { createStudioPage } from '../../shared';

test.describe('Form Studio', () => {
  /**
   * Tests use two form fixtures:
   * - formViaApi: Created via API (fast, ~1s) - use for most tests
   * - formViaUi: Created via UI with AI generation (slow, ~30s) - for UI flow tests
   */

  test('studio loads with AI-generated steps', async ({ authedPage, formViaUi }) => {
    const studio = createStudioPage(authedPage);

    await authedPage.goto(formViaUi.studioUrl);
    await studio.expectLoaded();

    // Form created via UI should have AI-generated steps
    await expect(studio.sidebar).toBeVisible();
    await expect(studio.canvas).toBeVisible();
    await studio.expectMinStepCount(1, { timeout: 10000 });
  });

  test('can select a step in the form', async ({ authedPage, formViaApi }) => {
    const studio = createStudioPage(authedPage);

    await authedPage.goto(formViaApi.studioUrl);
    await studio.expectLoaded();

    // Use actual step count from created form data (formViaApi always has steps)
    const stepCount = formViaApi.steps?.length ?? 0;
    await studio.expectStepCount(stepCount, { timeout: 10000 });
    await studio.selectStep(0);

    // Properties panel should show step details
    await expect(studio.propertiesPanel).toBeVisible();
  });

  test('can add a new step to form with existing steps', async ({ authedPage, formViaApi }) => {
    const studio = createStudioPage(authedPage);

    await authedPage.goto(formViaApi.studioUrl);
    await studio.expectLoaded();

    // Use actual step count from created form data (formViaApi always has steps)
    const initialCount = formViaApi.steps?.length ?? 0;
    await studio.expectStepCount(initialCount, { timeout: 10000 });

    await studio.addStep();

    // Should have one more step than before
    await studio.expectStepCount(initialCount + 1, { timeout: 10000 });
  });
});
