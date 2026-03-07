/**
 * Widget Types - Focused Tests
 *
 * Verifies the categorized type selector renders all 7 types correctly.
 * No saved data needed — uses authedPage and orgSlug from base fixtures.
 */
import { test, expect } from '../../../app/fixtures';
import { createWidgetsPage } from '../../../shared';

test.describe('Widget Type Selector', () => {
  test('categorized type selector', async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to widget builder', async () => {
      await widgets.gotoList();
      await widgets.clickCreateWidget();
      await widgets.expectBuilderTitle('Create Widget');
    });

    await test.step('3 category headings are visible', async () => {
      await widgets.expectCategoryVisible('Section Widgets');
      await widgets.expectCategoryVisible('Micro Widgets');
      await widgets.expectCategoryVisible('Ambient Widgets');
    });

    await test.step('7 type option buttons are visible', async () => {
      await widgets.expectTypeOptionCount(7);
    });

    await test.step('default type wall_of_love is selected', async () => {
      await widgets.expectTypeSelected('wall_of_love');
    });

    await test.step('click each new type and verify selection', async () => {
      await widgets.selectType('marquee');
      await widgets.expectTypeSelected('marquee');
      await widgets.expectTypeNotSelected('wall_of_love');

      await widgets.selectType('rating_badge');
      await widgets.expectTypeSelected('rating_badge');
      await widgets.expectTypeNotSelected('marquee');

      await widgets.selectType('avatars_bar');
      await widgets.expectTypeSelected('avatars_bar');
      await widgets.expectTypeNotSelected('rating_badge');

      await widgets.selectType('toast_popup');
      await widgets.expectTypeSelected('toast_popup');
      await widgets.expectTypeNotSelected('avatars_bar');
    });

    await test.step('previous selection deselects when switching', async () => {
      await widgets.selectType('wall_of_love');
      await widgets.expectTypeSelected('wall_of_love');
      await widgets.expectTypeNotSelected('toast_popup');
    });
  });
});
