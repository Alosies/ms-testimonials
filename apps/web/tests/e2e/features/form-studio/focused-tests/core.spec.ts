/**
 * Form Studio Tests (Focused)
 *
 * Focused tests for specific form builder/studio functionality.
 * These tests provide detailed assertions for debugging when journey tests fail.
 *
 * ## Test Organization
 * - journey.spec.ts - Quick validation of all features (run first)
 * - studio.spec.ts - This file: detailed tests for core functionality
 * - studio-navigation.spec.ts - Detailed tests for navigation features
 *
 * @see ./actions/ for shared action helpers
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test.describe('Form Studio', () => {
  /**
   * Tests use two form fixtures:
   * - formViaApi: Created via API (fast, ~1s) - use for most tests
   * - formViaUi: Created via UI with AI generation (slow, ~30s) - for UI flow tests
   */

  test('studio loads with AI-generated steps', async ({ authedPage, formViaUi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(formViaUi.studioUrl);

    // Focused assertion: verify all panels
    await expect(studio.sidebar).toBeVisible();
    await expect(studio.canvas).toBeVisible();
    await expect(studio.propertiesPanel).toBeVisible();

    // AI generation creates multiple steps
    await studio.expectMinStepCount(5, { timeout: 10000 });
    await studio.expectMinCanvasStepCount(3, { timeout: 10000 });
  });

  test('can select a step in the form', async ({ authedPage, formViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadWithSteps(formViaApi);

    // Select last step
    const steps = formViaApi.steps ?? [];
    const lastStep = steps[steps.length - 1];

    await actions.select.selectStep(lastStep.id);

    // Focused assertions: verify all selection indicators
    await studio.expectCanvasStepInViewport(lastStep.id);
    await expect(studio.propertiesPanel).toBeVisible();
  });

  test('can add a new step to form with existing steps', async ({ authedPage, formViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadWithSteps(formViaApi);

    const initialCount = formViaApi.steps?.length ?? 0;
    const newCount = await actions.manage.addStep('Question');

    // Focused assertions
    expect(newCount).toBe(initialCount + 1);

    // Verify new step is selectable
    await actions.select.selectStepByIndex(newCount - 1);
    await expect(studio.propertiesPanel).toBeVisible();
  });
});
