/**
 * Widget Type Settings - Focused Tests
 *
 * Verifies type-specific settings sections show/hide correctly
 * when switching between widget types.
 */
import { test, expect } from '../../../app/fixtures';
import { createWidgetsPage } from '../../../shared';

test.describe('Widget Type Settings', () => {
  test('type-specific settings visibility', async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to widget builder and switch to Design tab', async () => {
      await widgets.gotoList();
      await widgets.clickCreateWidget();
      await widgets.switchToDesignTab();
    });

    await test.step('wall_of_love has no type-specific settings', async () => {
      // Default type — no type-specific heading
      await expect(widgets.getTypeSettingsHeading('Marquee Settings')).toBeHidden();
      await expect(widgets.getTypeSettingsHeading('Rating Badge Settings')).toBeHidden();
      await expect(widgets.getTypeSettingsHeading('Avatars Bar Settings')).toBeHidden();
      await expect(widgets.getTypeSettingsHeading('Toast Popup Settings')).toBeHidden();
    });

    await test.step('marquee shows Marquee Settings', async () => {
      await widgets.selectType('marquee');
      await expect(widgets.getTypeSettingsHeading('Marquee Settings')).toBeVisible();
      // Others should be hidden
      await expect(widgets.getTypeSettingsHeading('Rating Badge Settings')).toBeHidden();
    });

    await test.step('rating_badge shows Rating Badge Settings', async () => {
      await widgets.selectType('rating_badge');
      await expect(widgets.getTypeSettingsHeading('Rating Badge Settings')).toBeVisible();
      await expect(widgets.getTypeSettingsHeading('Marquee Settings')).toBeHidden();
    });

    await test.step('avatars_bar shows Avatars Bar Settings', async () => {
      await widgets.selectType('avatars_bar');
      await expect(widgets.getTypeSettingsHeading('Avatars Bar Settings')).toBeVisible();
      await expect(widgets.getTypeSettingsHeading('Rating Badge Settings')).toBeHidden();
    });

    await test.step('toast_popup shows Toast Popup Settings', async () => {
      await widgets.selectType('toast_popup');
      await expect(widgets.getTypeSettingsHeading('Toast Popup Settings')).toBeVisible();
      await expect(widgets.getTypeSettingsHeading('Avatars Bar Settings')).toBeHidden();
    });

    await test.step('switching back to wall_of_love hides type-specific settings', async () => {
      await widgets.selectType('wall_of_love');
      await expect(widgets.getTypeSettingsHeading('Toast Popup Settings')).toBeHidden();
    });
  });
});
