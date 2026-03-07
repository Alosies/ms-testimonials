/**
 * Widget Type Settings Persistence - Focused Tests
 *
 * Verifies type-specific settings persist after save and reload.
 * Uses API fixtures for fast widget creation.
 */
import { test, expect } from '../../../entities/widget/fixtures';
import { createWidgetsPage } from '../../../shared';
import { widgetsTestIds } from '@/shared/constants/testIds';

test.describe('Widget Type Settings Persistence', () => {
  test('marquee settings persist after save', async ({ authedPage, marqueeWidgetViaApi }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to marquee widget builder', async () => {
      await authedPage.goto(marqueeWidgetViaApi.builderUrl);
      await widgets.builderPage.waitFor({ timeout: 10000 });
      // Wait for widget data to load (name populates from API response)
      await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
    });

    await test.step('modify marquee settings', async () => {
      await widgets.switchToDesignTab();

      // Change direction to 'right'
      await widgets.clickSettingsOption(widgetsTestIds.marqueeDirection, 'right');

      // Change card style to 'full'
      await widgets.clickSettingsOption(widgetsTestIds.marqueeCardStyle, 'full');
    });

    await test.step('save and reload', async () => {
      await widgets.save();
      await authedPage.waitForURL(/\/widgets\//, { timeout: 10000 });

      // Reload the page
      await authedPage.goto(marqueeWidgetViaApi.builderUrl);
      await widgets.builderPage.waitFor({ timeout: 10000 });
      // Wait for widget data to load (name populates from API response)
      await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
    });

    await test.step('verify marquee settings persisted', async () => {
      await widgets.switchToDesignTab();

      // Direction 'right' should be selected (has data-selected attribute)
      await widgets.expectSettingsOptionSelected(widgetsTestIds.marqueeDirection, 'right');

      // Card style 'full' should be selected
      await widgets.expectSettingsOptionSelected(widgetsTestIds.marqueeCardStyle, 'full');
    });
  });

  test('toast popup settings persist after save', async ({ authedPage, toastWidgetViaApi }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to toast widget builder', async () => {
      await authedPage.goto(toastWidgetViaApi.builderUrl);
      await widgets.builderPage.waitFor({ timeout: 10000 });
      // Wait for widget data to load (name populates from API response)
      await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
    });

    await test.step('modify toast settings', async () => {
      await widgets.switchToDesignTab();

      // Change position to 'top-right'
      await widgets.clickSettingsOption(widgetsTestIds.toastPosition, 'Top Right');

      // Change animation to 'fade'
      await widgets.clickSettingsOption(widgetsTestIds.toastAnimation, 'fade');
    });

    await test.step('save and reload', async () => {
      await widgets.save();
      await authedPage.waitForURL(/\/widgets\//, { timeout: 10000 });

      await authedPage.goto(toastWidgetViaApi.builderUrl);
      await widgets.builderPage.waitFor({ timeout: 10000 });
      // Wait for widget data to load (name populates from API response)
      await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
    });

    await test.step('verify toast settings persisted', async () => {
      await widgets.switchToDesignTab();

      // Position 'top-right' should be selected (has data-selected attribute)
      await widgets.expectSettingsOptionSelected(widgetsTestIds.toastPosition, 'Top Right');

      // Animation 'fade' should be selected
      await widgets.expectSettingsOptionSelected(widgetsTestIds.toastAnimation, 'fade');
    });
  });
});
