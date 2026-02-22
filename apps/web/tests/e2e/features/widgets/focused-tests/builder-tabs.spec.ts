/**
 * Widget Builder Tabs - Focused Tests
 *
 * Tests for the tabbed layout UX in the widget builder:
 * - Content tab (default): form selector + testimonial selector
 * - Design tab: theme, display toggles, max display, active toggle
 * - Always-visible zone: type selector + name input
 * - Content tab badge showing selected testimonial count
 * - State preservation across tab switches
 */
import { test, expect } from '../../../app/fixtures';
import { createWidgetsPage } from '../../../shared';
import { widgetsTestIds } from '@/shared/constants/testIds';

test.describe('Widget Builder Tabs', () => {
  /**
   * MVP: Combined test for tabbed layout structure and tab switching.
   * Covers: default tab, always-visible controls, tab content isolation,
   * and state preservation across tab switches.
   */
  test('tabbed layout structure and navigation', async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to widget builder', async () => {
      await widgets.gotoList();
      await widgets.clickCreateWidget();
      await widgets.expectBuilderTitle('Create Widget');
    });

    await test.step('Content tab is active by default', async () => {
      const contentTab = authedPage.getByRole('tab', { name: /Content/ });
      await expect(contentTab).toHaveAttribute('aria-selected', 'true');

      const designTab = authedPage.getByRole('tab', { name: 'Design' });
      await expect(designTab).toHaveAttribute('aria-selected', 'false');
    });

    await test.step('type selector and name input are always visible', async () => {
      // Visible on Content tab
      await expect(authedPage.getByTestId(widgetsTestIds.typeOption).first()).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.nameInput)).toBeVisible();

      // Switch to Design tab — still visible
      await widgets.switchToDesignTab();
      await expect(authedPage.getByTestId(widgetsTestIds.typeOption).first()).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.nameInput)).toBeVisible();
    });

    await test.step('Content tab shows form selector and testimonial list', async () => {
      await widgets.switchToContentTab();

      // Form selector visible (scoped to builder page)
      const builder = authedPage.getByTestId(widgetsTestIds.builderPage);
      await expect(builder.getByText('Scope testimonials to a specific form')).toBeVisible();

      // Testimonial list visible (use exact match scoped to builder)
      await expect(builder.getByText('Testimonials', { exact: true })).toBeVisible();
    });

    await test.step('Design tab shows theme, toggles, and settings', async () => {
      await widgets.switchToDesignTab();

      await expect(authedPage.getByTestId(widgetsTestIds.themeLight)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.themeDark)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowRatings)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowDates)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowCompany)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowAvatar)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.maxDisplayInput)).toBeVisible();
      await expect(authedPage.getByTestId(widgetsTestIds.switchIsActive)).toBeVisible();
    });

    await test.step('Design tab controls are hidden when on Content tab', async () => {
      await widgets.switchToContentTab();

      await expect(authedPage.getByTestId(widgetsTestIds.themeLight)).toBeHidden();
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowRatings)).toBeHidden();
    });
  });

  /**
   * MVP: Combined test for testimonial selection badge and state persistence.
   * Covers: badge appears with count, updates on selection changes,
   * and selections survive tab switching.
   */
  test('testimonial selection badge and state preservation', async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to widget builder', async () => {
      await widgets.gotoList();
      await widgets.clickCreateWidget();
    });

    await test.step('no badge when nothing selected', async () => {
      // Tab should just say "Content" with no count number
      const contentTab = authedPage.getByRole('tab', { name: /Content/ });
      await expect(contentTab).toHaveText('Content');
    });

    await test.step('badge appears after selecting a testimonial', async () => {
      const builder = authedPage.getByTestId(widgetsTestIds.builderPage);

      // Wait for testimonials to load, then click the first testimonial row
      await builder.getByText(/0 of \d+ selected/).waitFor();
      await builder.getByTestId(widgetsTestIds.testimonialRow).first().click();

      // Verify selection happened
      await expect(builder.getByText(/1 of \d+ selected/)).toBeVisible();

      // Tab text should now include a count number
      const contentTab = authedPage.getByRole('tab', { name: /Content/ });
      await expect(contentTab).toHaveText(/Content\s*1/);
    });

    await test.step('selections persist after switching to Design and back', async () => {
      const builder = authedPage.getByTestId(widgetsTestIds.builderPage);

      // Switch to Design, then back to Content
      await widgets.switchToDesignTab();
      await widgets.switchToContentTab();

      // Selection count should be preserved
      await expect(builder.getByText(/1 of \d+ selected/)).toBeVisible();
    });

    await test.step('badge disappears when deselecting testimonial', async () => {
      const builder = authedPage.getByTestId(widgetsTestIds.builderPage);

      // Click the first row again to deselect
      await builder.getByTestId(widgetsTestIds.testimonialRow).first().click();

      // Tab should go back to just "Content" with no count
      const contentTab = authedPage.getByRole('tab', { name: /Content/ });
      await expect(contentTab).toHaveText('Content');

      await expect(builder.getByText(/0 of \d+ selected/)).toBeVisible();
    });
  });

  /**
   * Tests that design settings configured on Design tab persist after save
   * and are correctly loaded on edit, including display toggle switches.
   */
  test('design tab settings persist after save', async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);
    const uniqueName = `Tab Test ${Date.now()}`;

    await test.step('create widget with specific design settings', async () => {
      await widgets.gotoList();
      await widgets.clickCreateWidget();

      // Fill name (always visible)
      await widgets.fillName(uniqueName);

      // Switch to Design tab and configure
      await widgets.switchToDesignTab();

      // Toggle off show ratings (on by default)
      await authedPage.getByTestId(widgetsTestIds.switchShowRatings).click();

      // Toggle on show dates (off by default)
      await authedPage.getByTestId(widgetsTestIds.switchShowDates).click();

      // Set max display
      await authedPage.getByTestId(widgetsTestIds.maxDisplayInput).fill('5');
    });

    await test.step('save and navigate back', async () => {
      await widgets.save();
      await authedPage.waitForURL(/\/widgets\//, { timeout: 10000 });
      await widgets.builderBackButton.click();
      await widgets.listPage.waitFor({ timeout: 10000 });
    });

    await test.step('edit widget and verify design settings loaded', async () => {
      const cardWithName = authedPage.locator(
        `[data-testid="${widgetsTestIds.widgetCard}"]`,
      ).filter({
        has: authedPage.locator(`[data-testid="${widgetsTestIds.widgetCardName}"]`, { hasText: uniqueName }),
      });
      await cardWithName.click();
      await widgets.builderPage.waitFor({ timeout: 10000 });

      // Switch to Design tab to check settings
      await widgets.switchToDesignTab();

      // Show ratings should be off (we toggled it off)
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowRatings)).toHaveAttribute('aria-checked', 'false');

      // Show dates should be on (we toggled it on)
      await expect(authedPage.getByTestId(widgetsTestIds.switchShowDates)).toHaveAttribute('aria-checked', 'true');

      // Max display should be 5
      await expect(authedPage.getByTestId(widgetsTestIds.maxDisplayInput)).toHaveValue('5');
    });

    await test.step('cleanup: delete the widget', async () => {
      await widgets.builderBackButton.click();
      await widgets.listPage.waitFor({ timeout: 10000 });

      const cardWithName = authedPage.locator(
        `[data-testid="${widgetsTestIds.widgetCard}"]`,
      ).filter({
        has: authedPage.locator(`[data-testid="${widgetsTestIds.widgetCardName}"]`, { hasText: uniqueName }),
      });
      await cardWithName.hover();
      await cardWithName.getByTestId(widgetsTestIds.widgetCardDeleteButton).click();
      await widgets.confirmDelete();
      await expect(cardWithName).toBeHidden({ timeout: 5000 });
    });
  });

  test('save button disabled when name is empty', async ({ authedPage }) => {
    const widgets = createWidgetsPage(authedPage);

    await test.step('navigate to widget builder', async () => {
      await widgets.gotoList();
      await widgets.clickCreateWidget();
    });

    await test.step('save is disabled with empty name', async () => {
      await expect(authedPage.getByTestId(widgetsTestIds.nameInput)).toHaveValue('');
      await expect(authedPage.getByTestId(widgetsTestIds.builderSaveButton)).toBeDisabled();
    });

    await test.step('save is enabled after entering a name', async () => {
      await widgets.fillName('Test');
      await expect(authedPage.getByTestId(widgetsTestIds.builderSaveButton)).toBeEnabled();
    });

    await test.step('save is disabled again after clearing name', async () => {
      await authedPage.getByTestId(widgetsTestIds.nameInput).clear();
      await expect(authedPage.getByTestId(widgetsTestIds.builderSaveButton)).toBeDisabled();
    });
  });
});
