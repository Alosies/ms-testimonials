/**
 * Studio Page Object
 *
 * Page object for the Form Studio editor. Provides locators and actions
 * for interacting with the form builder UI.
 */
import { Page, expect } from '@playwright/test';
import { studioTestIds } from '@/shared/constants/testIds';

export function createStudioPage(page: Page) {
  // Locators using centralized test IDs
  const sidebar = page.getByTestId(studioTestIds.sidebar);
  const canvas = page.getByTestId(studioTestIds.canvas);
  const canvasEmpty = page.getByTestId(studioTestIds.canvasEmptyState);
  const stepCards = page.getByTestId(studioTestIds.sidebarStepCard);
  const sidebarAddButton = page.getByTestId(studioTestIds.sidebarAddButton);
  const canvasAddButton = page.getByTestId(studioTestIds.canvasAddButton);
  const saveStatus = page.getByTestId(studioTestIds.headerSaveStatus);
  const propertiesPanel = page.getByTestId(studioTestIds.propertiesPanel);

  return {
    // Expose page and locators
    page,
    sidebar,
    canvas,
    canvasEmpty,
    stepCards,
    sidebarAddButton,
    canvasAddButton,
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

    /**
     * Add a step to the form.
     * Uses canvas add button for empty forms, sidebar add button otherwise.
     * Opens step type picker and selects the specified type (defaults to Question).
     */
    async addStep(type: 'Welcome' | 'Question' | 'Rating' | 'Consent' | 'Contact Info' | 'Reward' | 'Thank You' = 'Question') {
      // Use canvas button if empty state is visible, otherwise use sidebar
      const canvasVisible = await canvasAddButton.isVisible().catch(() => false);
      if (canvasVisible) {
        await canvasAddButton.click();
      } else {
        await sidebarAddButton.click();
      }

      // Wait for dropdown to appear and select step type
      await page.getByRole('menuitem', { name: new RegExp(type, 'i') }).click();

      // Wait for step to be added
      await page.waitForTimeout(500); // Brief wait for UI update
    },

    // Assertions
    async expectLoaded(options?: { timeout?: number }) {
      const timeout = options?.timeout ?? 15000;
      // Wait for the studio layout containers to be visible
      await expect(sidebar).toBeVisible({ timeout });
      await expect(canvas).toBeVisible({ timeout });
      // Wait for either step cards OR empty state to be visible
      const hasContent = stepCards.first().or(canvasEmpty);
      await expect(hasContent).toBeVisible({ timeout });
    },

    async expectStepCount(count: number, options?: { timeout?: number }) {
      await expect(stepCards).toHaveCount(count, options);
    },

    /**
     * Expect at least a minimum number of steps
     */
    async expectMinStepCount(minCount: number, options?: { timeout?: number }) {
      await expect(async () => {
        const count = await stepCards.count();
        expect(count).toBeGreaterThanOrEqual(minCount);
      }).toPass(options);
    },

    /**
     * Get current step count
     */
    async getStepCount(): Promise<number> {
      return await stepCards.count();
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
