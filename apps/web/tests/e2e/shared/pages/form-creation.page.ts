/**
 * Form Creation Wizard Page Object
 *
 * Handles the multi-step form creation flow:
 * 1. Select category (Product, Service, Course, Community, Event, Other)
 * 2. Enter form name
 * 3. Enter description
 * 4. Select focus areas
 * 5. Generate with AI
 * 6. Navigate to Form Studio
 */
import { Page } from '@playwright/test';
import { studioTestIds } from '@/shared/constants/testIds';

export function createFormCreationPage(page: Page) {
  return {
    page,

    /**
     * Navigate to the form creation wizard
     */
    async goto(orgSlug: string) {
      await page.goto(`/${orgSlug}/forms/creating`);
      // Wait for first step to load
      await page.getByRole('heading', { name: /what are you collecting/i }).waitFor({ timeout: 10000 });
    },

    /**
     * Step 1: Select category type
     */
    async selectCategory(category: 'Product' | 'Service' | 'Course' | 'Community' | 'Event' | 'Other') {
      await page.getByRole('button', { name: new RegExp(category, 'i') }).click();
    },

    /**
     * Step 1: Enter form name
     */
    async enterName(name: string) {
      await page.getByRole('textbox', { name: 'Name' }).fill(name);
    },

    /**
     * Click Continue button
     */
    async clickContinue() {
      await page.getByRole('button', { name: 'Continue' }).click();
    },

    /**
     * Step 2: Enter description
     */
    async enterDescription(description: string) {
      await page.getByRole('textbox', { name: 'Description' }).fill(description);
    },

    /**
     * Step 3: Select focus areas (optional, can select multiple)
     */
    async selectFocusArea(area: string) {
      await page.getByRole('button', { name: new RegExp(area, 'i') }).click();
    },

    /**
     * Step 3: Click Generate with AI
     */
    async clickGenerateWithAI() {
      await page.getByRole('button', { name: 'Generate with AI' }).click();
    },

    /**
     * Wait for AI generation to complete
     */
    async waitForAIGeneration() {
      // Wait for the "Customize in Form Studio" button to appear
      await page.getByRole('button', { name: 'Customize in Form Studio' }).waitFor({ timeout: 30000 });
    },

    /**
     * Click "Customize in Form Studio" to complete creation
     */
    async clickCustomizeInStudio() {
      await page.getByRole('button', { name: 'Customize in Form Studio' }).click();
      // Wait for studio URL
      await page.waitForURL(/\/studio/, { timeout: 10000 });
      // Wait for studio sidebar to be visible (indicates layout loaded)
      await page.getByTestId(studioTestIds.sidebar).waitFor({ timeout: 15000 });
      // Wait for at least one step card to appear (AI-generated steps)
      await page.getByTestId(studioTestIds.sidebarStepCard).first().waitFor({ timeout: 15000 });
    },

    /**
     * Complete the entire form creation flow
     * Returns the studio URL
     */
    async createForm(options: {
      orgSlug: string;
      name: string;
      description?: string;
      category?: 'Product' | 'Service' | 'Course' | 'Community' | 'Event' | 'Other';
    }): Promise<{ studioUrl: string; formId: string }> {
      const {
        orgSlug,
        name,
        description = 'A test form for E2E testing',
        category = 'Product',
      } = options;

      // Navigate to creation wizard
      await this.goto(orgSlug);

      // Step 1: Select category and enter name
      await this.selectCategory(category);
      await this.enterName(name);
      await this.clickContinue();

      // Step 2: Enter description
      await page.getByRole('heading', { name: /tell us about/i }).waitFor({ timeout: 5000 });
      await this.enterDescription(description);
      await this.clickContinue();

      // Step 3: Focus areas - skip selection, just generate
      await page.getByRole('heading', { name: /what should testimonials/i }).waitFor({ timeout: 5000 });
      await this.clickGenerateWithAI();

      // Wait for AI generation
      await this.waitForAIGeneration();

      // Complete creation and go to studio
      await this.clickCustomizeInStudio();

      // Extract form ID and studio URL from the final URL
      const studioUrl = page.url();
      // URL format: /{org}/forms/{form-slug}_formId/studio
      const urlMatch = studioUrl.match(/\/forms\/([^/]+)\/studio/);
      const formSlugWithId = urlMatch?.[1] || '';
      const formId = formSlugWithId.split('_').pop() || '';

      return { studioUrl, formId };
    },
  };
}

export type FormCreationPage = ReturnType<typeof createFormCreationPage>;
