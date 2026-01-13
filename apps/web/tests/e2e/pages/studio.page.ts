import { Page, expect } from '@playwright/test';
import { studioTestIds } from '../../../src/shared/constants/testIds';

export function createStudioPage(page: Page) {
  // Locators using centralized test IDs
  const sidebar = page.getByTestId(studioTestIds.sidebar);
  const canvas = page.getByTestId(studioTestIds.canvas);
  const stepCards = page.getByTestId(studioTestIds.sidebarStepCard);
  const addStepButton = page.getByTestId(studioTestIds.sidebarAddButton);
  const saveStatus = page.getByTestId(studioTestIds.headerSaveStatus);
  const propertiesPanel = page.getByTestId(studioTestIds.propertiesPanel);

  return {
    // Expose page and locators
    page,
    sidebar,
    canvas,
    stepCards,
    addStepButton,
    saveStatus,
    propertiesPanel,

    // Navigation
    async goto(orgSlug: string, formSlug: string) {
      await page.goto(`/${orgSlug}/forms/${formSlug}/studio`);
      await sidebar.waitFor({ timeout: 10000 });
    },

    // Actions
    async selectStep(index: number) {
      await stepCards.nth(index).click();
    },

    async addStep(type: string) {
      await addStepButton.click();
      await page.getByTestId(studioTestIds.stepTypeOption(type)).click();
    },

    // Assertions
    async expectLoaded() {
      await expect(sidebar).toBeVisible();
      await expect(canvas).toBeVisible();
    },

    async expectStepCount(count: number) {
      await expect(stepCards).toHaveCount(count);
    },

    async expectSaved() {
      await expect(saveStatus).toContainText(/saved/i);
    },

    async expectSaving() {
      await expect(saveStatus).toContainText(/saving/i);
    },
  };
}

export type StudioPage = ReturnType<typeof createStudioPage>;
