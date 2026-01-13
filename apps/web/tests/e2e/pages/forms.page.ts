import { Page, expect } from '@playwright/test';
import { formsTestIds } from '../../../src/shared/constants/testIds';

export function createFormsPage(page: Page) {
  const formsList = page.getByTestId(formsTestIds.formsList);
  const formsListItems = page.getByTestId(formsTestIds.formsListItem);
  const createButton = page.getByTestId(formsTestIds.formsCreateButton);
  const emptyState = page.getByTestId(formsTestIds.formsEmptyState);

  return {
    page,
    formsList,
    formsListItems,
    createButton,
    emptyState,

    async goto() {
      await page.goto('/forms');
      // Wait for either forms list or empty state
      await Promise.race([
        formsList.waitFor({ timeout: 10000 }),
        emptyState.waitFor({ timeout: 10000 }),
      ]).catch(() => {
        // One of them should be visible
      });
    },

    async createForm(name: string) {
      await createButton.click();
      await page.getByTestId(formsTestIds.createFormNameInput).fill(name);
      await page.getByTestId(formsTestIds.createFormSubmitButton).click();
    },

    async expectFormCount(count: number) {
      await expect(formsListItems).toHaveCount(count);
    },

    async clickForm(index: number) {
      await formsListItems.nth(index).click();
    },
  };
}

export type FormsPage = ReturnType<typeof createFormsPage>;
