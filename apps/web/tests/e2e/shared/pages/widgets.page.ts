/**
 * Widgets Page Object
 *
 * Page object for widgets list and builder pages. Provides locators
 * and actions for interacting with the widgets UI.
 */
import { Page, Locator, expect } from '@playwright/test';
import { widgetsTestIds } from '@/shared/constants/testIds';
import type { WidgetType } from '@testimonials/core';

export function createWidgetsPage(page: Page) {
  // List page locators
  const listPage = page.getByTestId(widgetsTestIds.listPage);
  const listTitle = page.getByTestId(widgetsTestIds.listPageTitle);
  const listCreateButton = page.getByTestId(widgetsTestIds.listCreateButton);
  const emptyState = page.getByTestId(widgetsTestIds.emptyState);
  const emptyStateCreateButton = page.getByTestId(widgetsTestIds.emptyStateCreateButton);
  const widgetCards = page.getByTestId(widgetsTestIds.widgetCard);

  // Builder page locators
  const builderPage = page.getByTestId(widgetsTestIds.builderPage);
  const builderTitle = page.getByTestId(widgetsTestIds.builderTitle);
  const builderBackButton = page.getByTestId(widgetsTestIds.builderBackButton);
  const builderSaveButton = page.getByTestId(widgetsTestIds.builderSaveButton);
  const builderEmbedButton = page.getByTestId(widgetsTestIds.builderEmbedButton);

  // Settings locators
  const nameInput = page.getByTestId(widgetsTestIds.nameInput);
  const themeLight = page.getByTestId(widgetsTestIds.themeLight);
  const themeDark = page.getByTestId(widgetsTestIds.themeDark);

  // Embed modal locators
  const embedModal = page.getByTestId(widgetsTestIds.embedModal);
  const embedCode = page.getByTestId(widgetsTestIds.embedCode);
  const embedCopyButton = page.getByTestId(widgetsTestIds.embedCopyButton);

  // Confirmation modal locators
  const confirmModal = page.getByTestId(widgetsTestIds.confirmationModal);
  const confirmButton = page.getByTestId(widgetsTestIds.confirmationModalConfirmButton);
  const cancelButton = page.getByTestId(widgetsTestIds.confirmationModalCancelButton);

  return {
    page,
    // List page
    listPage,
    listTitle,
    listCreateButton,
    emptyState,
    emptyStateCreateButton,
    widgetCards,
    // Builder page
    builderPage,
    builderTitle,
    builderBackButton,
    builderSaveButton,
    builderEmbedButton,
    // Settings
    nameInput,
    themeLight,
    themeDark,
    // Embed modal
    embedModal,
    embedCode,
    embedCopyButton,
    // Confirmation modal
    confirmModal,
    confirmButton,
    cancelButton,

    /** Navigate to widgets list via sidebar */
    async gotoList() {
      await page.getByTestId(widgetsTestIds.navWidgets).click();
      await Promise.race([
        listPage.waitFor({ timeout: 10000 }),
        emptyState.waitFor({ timeout: 10000 }),
      ]).catch(() => {});
    },

    /** Click the "Create Widget" button (from list or empty state) */
    async clickCreateWidget() {
      const btn = await listCreateButton.or(emptyStateCreateButton).first();
      await btn.click();
      await builderPage.waitFor({ timeout: 10000 });
    },

    /** Select a widget type in the builder */
    async selectType(type: WidgetType) {
      await page.locator(`[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`).click();
    },

    /** Fill the widget name input */
    async fillName(name: string) {
      await nameInput.clear();
      await nameInput.fill(name);
    },

    /** Save the widget */
    async save() {
      await builderSaveButton.click();
      // Wait for save button to re-enable (disabled during save)
      await expect(builderSaveButton).toBeEnabled({ timeout: 10000 });
    },

    /** Open embed code modal */
    async openEmbedModal() {
      await builderEmbedButton.click();
      await embedModal.waitFor({ timeout: 5000 });
    },

    /** Close embed code modal */
    async closeEmbedModal() {
      await page.keyboard.press('Escape');
      await embedModal.waitFor({ state: 'hidden', timeout: 5000 });
    },

    /** Get a specific widget card by index */
    getWidgetCard(index: number): Locator {
      return widgetCards.nth(index);
    },

    /** Click the delete button on a widget card */
    async deleteWidgetCard(index: number) {
      const card = widgetCards.nth(index);
      await card.hover();
      await card.getByTestId(widgetsTestIds.widgetCardDeleteButton).click();
    },

    /** Confirm deletion in the confirmation modal */
    async confirmDelete() {
      await confirmModal.waitFor({ timeout: 5000 });
      await confirmButton.click();
      await confirmModal.waitFor({ state: 'hidden', timeout: 5000 });
    },

    /** Assert widget card count */
    async expectWidgetCount(count: number) {
      await expect(widgetCards).toHaveCount(count);
    },

    /** Switch to the Design tab in the widget builder */
    async switchToDesignTab() {
      await page.getByTestId(widgetsTestIds.tabDesign).click();
    },

    /** Switch to the Content tab in the widget builder */
    async switchToContentTab() {
      await page.getByTestId(widgetsTestIds.tabContent).click();
    },

    /** Assert builder title */
    async expectBuilderTitle(text: string) {
      await expect(builderTitle).toContainText(text);
    },

    /** Assert a type category heading is visible */
    async expectCategoryVisible(categoryLabel: string) {
      const category = page.getByTestId(widgetsTestIds.typeCategory).filter({ hasText: categoryLabel });
      await expect(category).toBeVisible();
    },

    /** Count type option buttons */
    async expectTypeOptionCount(count: number) {
      await expect(page.getByTestId(widgetsTestIds.typeOption)).toHaveCount(count);
    },

    /** Assert the selected type option is marked as selected */
    async expectTypeSelected(type: WidgetType) {
      const option = page.locator(
        `[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`
      );
      await expect(option).toHaveAttribute('data-selected', 'true');
    },

    /** Assert the type option is NOT selected */
    async expectTypeNotSelected(type: WidgetType) {
      const option = page.locator(
        `[data-testid="${widgetsTestIds.typeOption}"][data-widget-type="${type}"]`
      );
      await expect(option).not.toHaveAttribute('data-selected', 'true');
    },

    /** Get the type-specific settings heading */
    getTypeSettingsHeading(label: string): Locator {
      return page.getByTestId(widgetsTestIds.settingsHeading).filter({ hasText: label });
    },

    /** Get the toast embed note element */
    get embedToastNote(): Locator {
      return page.getByTestId(widgetsTestIds.embedToastNote);
    },

    /** Get a settings option button by testid and value */
    getSettingsOption(testId: string, value: string): Locator {
      return page.locator(`[data-testid="${testId}"]`).filter({ hasText: value });
    },

    /** Click a settings option button by testid and label */
    async clickSettingsOption(testId: string, label: string) {
      await this.getSettingsOption(testId, label).click();
    },

    /** Assert a settings option is selected */
    async expectSettingsOptionSelected(testId: string, label: string) {
      await expect(this.getSettingsOption(testId, label)).toHaveAttribute('data-selected', 'true');
    },
  };
}

export type WidgetsPage = ReturnType<typeof createWidgetsPage>;
