/**
 * Widgets Journey Test
 *
 * Complete end-to-end flow covering:
 * 1. Navigate to widgets list (empty state)
 * 2. Create a widget via builder
 * 3. Verify widget appears in list
 * 4. Edit widget and verify settings persist
 * 5. View embed code modal
 * 6. Delete widget and verify removal
 */
import { test, expect } from '../../../app/fixtures';
import { createWidgetsPage } from '../../../shared';
import { widgetsTestIds } from '@/shared/constants/testIds';

test.describe('Widgets', () => {
  test('widget CRUD journey', { tag: '@smoke' }, async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);
    const uniqueName = `Test Widget ${Date.now()}`;

    await test.step('1. Navigate to widgets list', async () => {
      await widgets.gotoList();
      // Should see either empty state or widgets list
      const listOrEmpty = widgets.listPage.or(widgets.emptyState);
      await expect(listOrEmpty).toBeVisible();
    });

    await test.step('2. Open widget builder (create mode)', async () => {
      await widgets.clickCreateWidget();
      await widgets.expectBuilderTitle('Create Widget');
    });

    await test.step('3. Configure widget settings', async () => {
      // Select carousel type
      await widgets.selectType('carousel');

      // Fill name
      await widgets.fillName(uniqueName);

      // Select dark theme
      await authedPage.getByTestId(widgetsTestIds.themeDark).click();
    });

    await test.step('4. Save widget', async () => {
      await widgets.save();

      // After save, should redirect to edit URL (URL changes)
      await authedPage.waitForURL(/\/widgets\//, { timeout: 10000 });

      // Embed button should now appear
      await expect(widgets.builderEmbedButton).toBeVisible();
    });

    await test.step('5. Verify embed code modal', async () => {
      await widgets.openEmbedModal();

      // Embed code should contain the widget type and script tag
      const codeText = await widgets.embedCode.textContent();
      expect(codeText).toContain('data-testimonials-widget="carousel"');
      expect(codeText).toContain('/embed/widgets.js');

      await widgets.closeEmbedModal();
    });

    await test.step('6. Navigate back to list and verify widget exists', async () => {
      await widgets.builderBackButton.click();
      await widgets.listPage.waitFor({ timeout: 10000 });

      // Find our widget card by name
      const cardWithName = authedPage.locator(
        `[data-testid="${widgetsTestIds.widgetCard}"]`,
      ).filter({
        has: authedPage.locator(`[data-testid="${widgetsTestIds.widgetCardName}"]`, { hasText: uniqueName }),
      });
      await expect(cardWithName).toBeVisible();

      // Verify type badge shows "Carousel"
      await expect(cardWithName.getByTestId(widgetsTestIds.widgetCardType)).toContainText('Carousel');
    });

    await test.step('7. Edit widget and verify settings loaded', async () => {
      // Click the card to edit
      const cardWithName = authedPage.locator(
        `[data-testid="${widgetsTestIds.widgetCard}"]`,
      ).filter({
        has: authedPage.locator(`[data-testid="${widgetsTestIds.widgetCardName}"]`, { hasText: uniqueName }),
      });
      await cardWithName.click();
      await widgets.builderPage.waitFor({ timeout: 10000 });

      // Builder should be in edit mode
      await widgets.expectBuilderTitle('Edit Widget');

      // Name should be loaded
      await expect(widgets.nameInput).toHaveValue(uniqueName);

      // Dark theme should be selected (has ring class)
      await expect(authedPage.getByTestId(widgetsTestIds.themeDark)).toHaveClass(/ring-2/);
    });

    await test.step('8. Delete widget', async () => {
      // Go back to list
      await widgets.builderBackButton.click();
      await widgets.listPage.waitFor({ timeout: 10000 });

      // Find and delete our widget
      const cardWithName = authedPage.locator(
        `[data-testid="${widgetsTestIds.widgetCard}"]`,
      ).filter({
        has: authedPage.locator(`[data-testid="${widgetsTestIds.widgetCardName}"]`, { hasText: uniqueName }),
      });
      await cardWithName.hover();
      await cardWithName.getByTestId(widgetsTestIds.widgetCardDeleteButton).click();

      // Confirm deletion
      await widgets.confirmDelete();

      // Widget should no longer appear
      await expect(cardWithName).toBeHidden({ timeout: 5000 });
    });
  });
});
