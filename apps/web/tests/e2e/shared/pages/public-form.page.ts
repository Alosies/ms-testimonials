/**
 * Public Form Page Object
 *
 * Page object for the customer-facing public form (/f/{urlSlug}).
 * Used for testing form persistence, analytics, and submission flow.
 */
import { Page, Locator, expect } from '@playwright/test';
import { publicFormTestIds } from '@/shared/constants/testIds';

export interface PublicFormPage {
  page: Page;
  container: Locator;
  progressBar: Locator;
  stepCard: Locator;
  backButton: Locator;
  continueButton: Locator;
  submitButton: Locator;
  stepIndicator: Locator;

  // Navigation
  goto(publicUrl: string): Promise<void>;
  waitForLoad(): Promise<void>;

  // Step identification
  getCurrentStepType(): Promise<string | null>;
  getCurrentStepIndex(): Promise<number>;
  getStepCount(): Promise<number>;

  // Navigation actions
  clickContinue(): Promise<void>;
  clickBack(): Promise<void>;
  clickSubmit(): Promise<void>;

  // Assertions
  expectStepType(stepType: string): Promise<void>;
  expectContinueButton(): Promise<void>;
  expectSubmitButton(): Promise<void>;
  expectNoNavigation(): Promise<void>;
}

export function createPublicFormPage(page: Page): PublicFormPage {
  const container = page.getByTestId(publicFormTestIds.container);
  const progressBar = page.getByTestId(publicFormTestIds.progressBar);
  const stepCard = page.getByTestId(publicFormTestIds.stepCard);
  const backButton = page.getByTestId(publicFormTestIds.backButton);
  const continueButton = page.getByTestId(publicFormTestIds.continueButton);
  const submitButton = page.getByTestId(publicFormTestIds.submitButton);
  const stepIndicator = page.getByTestId(publicFormTestIds.stepIndicator);

  return {
    page,
    container,
    progressBar,
    stepCard,
    backButton,
    continueButton,
    submitButton,
    stepIndicator,

    async goto(publicUrl: string) {
      await page.goto(publicUrl);
      await this.waitForLoad();
    },

    async waitForLoad() {
      // Wait for either the form container or error message
      await expect(container.or(page.getByTestId(publicFormTestIds.notFoundMessage))).toBeVisible({
        timeout: 10000,
      });
    },

    async getCurrentStepType() {
      const type = await stepCard.getAttribute('data-step-type');
      return type;
    },

    async getCurrentStepIndex() {
      const index = await stepCard.getAttribute('data-step-index');
      return index ? parseInt(index, 10) : 0;
    },

    async getStepCount() {
      const dots = page.getByTestId(publicFormTestIds.stepDot);
      return await dots.count();
    },

    async clickContinue() {
      await continueButton.click();
      // Wait for step transition
      await page.waitForTimeout(300);
    },

    async clickBack() {
      await backButton.click();
      await page.waitForTimeout(300);
    },

    async clickSubmit() {
      await submitButton.click();
      await page.waitForTimeout(300);
    },

    async expectStepType(stepType: string) {
      await expect(stepCard).toHaveAttribute('data-step-type', stepType);
    },

    async expectContinueButton() {
      await expect(continueButton).toBeVisible();
      await expect(submitButton).not.toBeVisible();
    },

    async expectSubmitButton() {
      await expect(submitButton).toBeVisible();
      await expect(continueButton).not.toBeVisible();
    },

    async expectNoNavigation() {
      await expect(continueButton).not.toBeVisible();
      await expect(submitButton).not.toBeVisible();
      await expect(backButton).not.toBeVisible();
    },
  };
}
