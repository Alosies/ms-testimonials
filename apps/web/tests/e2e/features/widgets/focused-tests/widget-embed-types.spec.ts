/**
 * Widget Embed Types - Focused Tests
 *
 * Verifies embed code modal shows correct type attribute and
 * toast-specific guidance note.
 */
import { test, expect } from '../../../entities/widget/fixtures';
import { createWidgetsPage } from '../../../shared';

test.describe('Widget Embed Types', () => {
  test('marquee embed code contains correct type', async ({ authedPage, marqueeWidgetViaApi }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to marquee widget builder', async () => {
      await authedPage.goto(marqueeWidgetViaApi.builderUrl);
      await widgets.builderPage.waitFor({ timeout: 10000 });
      // Wait for widget data to load (name populates from API response)
      await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
    });

    await test.step('open embed modal and verify code', async () => {
      await widgets.openEmbedModal();

      const codeText = await widgets.embedCode.textContent();
      expect(codeText).toContain('data-testimonials-widget="marquee"');
      expect(codeText).toContain('/embed/widgets.js');

      // Toast note should NOT be visible for marquee
      await expect(widgets.embedToastNote).toBeHidden();

      await widgets.closeEmbedModal();
    });
  });

  test('toast_popup embed code shows placement note', async ({ authedPage, toastWidgetViaApi }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to toast widget builder', async () => {
      await authedPage.goto(toastWidgetViaApi.builderUrl);
      await widgets.builderPage.waitFor({ timeout: 10000 });
      // Wait for widget data to load (name populates from API response)
      await expect(widgets.nameInput).not.toHaveValue('', { timeout: 10000 });
    });

    await test.step('open embed modal and verify code + toast note', async () => {
      await widgets.openEmbedModal();

      const codeText = await widgets.embedCode.textContent();
      expect(codeText).toContain('data-testimonials-widget="toast_popup"');

      // Toast placement note should be visible
      await expect(widgets.embedToastNote).toBeVisible();

      await widgets.closeEmbedModal();
    });
  });
});
