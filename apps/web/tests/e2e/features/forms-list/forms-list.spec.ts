/**
 * Forms List Tests
 *
 * Tests for the forms list page functionality.
 */
import { test, expect } from '../../app/fixtures';
import { createFormsPage } from '../../shared';

test.describe('Forms List', () => {
  test('user can access forms list', async ({ authedPage }) => {
    const formsPage = createFormsPage(authedPage);
    await formsPage.goto();

    // Should see either forms list or empty state
    const formsList = formsPage.formsList;
    const emptyState = formsPage.emptyState;

    await expect(formsList.or(emptyState)).toBeVisible();
  });
});
