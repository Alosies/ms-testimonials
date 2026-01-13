import { test, expect } from '../fixtures';
import { createStudioPage, createFormsPage } from '../pages';

test.describe('Smoke Tests', () => {
  test.describe('Critical Path', () => {
    test('user can access forms list after login', async ({ authedPage }) => {
      const formsPage = createFormsPage(authedPage);
      await formsPage.goto();

      // Should see either forms list or empty state
      const hasFormsList = await formsPage.formsList.isVisible().catch(() => false);
      const hasEmptyState = await formsPage.emptyState.isVisible().catch(() => false);

      expect(hasFormsList || hasEmptyState).toBe(true);
    });

    test('user can navigate to form studio', async ({ authedPage }) => {
      // This test assumes a form already exists
      // Skip if no forms exist
      const formsPage = createFormsPage(authedPage);
      await formsPage.goto();

      const formCount = await formsPage.formsListItems.count();
      if (formCount === 0) {
        test.skip(true, 'No forms exist to test studio navigation');
        return;
      }

      // Click first form
      await formsPage.clickForm(0);

      // Should navigate to studio or form detail
      await expect(authedPage).toHaveURL(/\/forms\/.*\/(studio|edit|detail)/);
    });
  });

  test.describe('Form Studio', () => {
    // This test requires a known form to exist
    // Update orgSlug and formSlug with actual test values
    const testFormConfig = {
      orgSlug: process.env.TEST_ORG_SLUG || 'test-org',
      formSlug: process.env.TEST_FORM_SLUG || 'test-form',
    };

    test.skip('studio loads with sidebar and canvas', async ({ authedPage }) => {
      const studio = createStudioPage(authedPage);
      await studio.goto(testFormConfig.orgSlug, testFormConfig.formSlug);

      await studio.expectLoaded();
    });

    test.skip('can select a step in sidebar', async ({ authedPage }) => {
      const studio = createStudioPage(authedPage);
      await studio.goto(testFormConfig.orgSlug, testFormConfig.formSlug);
      await studio.expectLoaded();

      const stepCount = await studio.stepCards.count();
      if (stepCount === 0) {
        test.skip(true, 'No steps exist in form');
        return;
      }

      await studio.selectStep(0);
      await expect(studio.propertiesPanel).toBeVisible();
    });
  });
});
