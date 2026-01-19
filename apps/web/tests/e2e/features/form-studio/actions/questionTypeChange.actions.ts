/**
 * Question Type Change Actions
 *
 * Actions for testing ADR-017: Question Type Change Workflow
 *
 * Handles:
 * - Warning dialogs when changing from choice types
 * - Blocked state when responses exist
 * - Delete responses confirmation flow
 */
import { expect } from '@playwright/test';
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import { studioTestIds, widgetsTestIds } from '@/shared/constants/testIds';

/**
 * Question type display names mapping
 */
export const QUESTION_TYPE_NAMES = {
  text_short: 'Short answer',
  text_long: 'Paragraph',
  text_email: 'Email',
  text_url: 'URL',
  choice_single: 'Multiple choice',
  choice_multiple: 'Checkboxes',
  choice_dropdown: 'Dropdown',
  rating_star: 'Star rating',
  rating_scale: 'Linear scale',
  input_date: 'Date',
  input_time: 'Time',
  input_switch: 'Switch',
  input_checkbox: 'Checkbox',
  special_hidden: 'Hidden field',
} as const;

export type QuestionTypeKey = keyof typeof QUESTION_TYPE_NAMES;

export function createQuestionTypeChangeActions(studio: StudioPage) {
  const { page } = studio;

  return {
    // ========================================
    // Dropdown State Actions
    // ========================================

    /**
     * Check if the question type dropdown is disabled
     */
    async expectTypeDropdownDisabled() {
      const dropdown = page.getByTestId(studioTestIds.questionTypeDropdown);
      await expect(dropdown).toBeDisabled();
    },

    /**
     * Check if the question type dropdown is enabled
     */
    async expectTypeDropdownEnabled() {
      const dropdown = page.getByTestId(studioTestIds.questionTypeDropdown);
      await expect(dropdown).toBeEnabled();
    },

    /**
     * Wait for the question type dropdown to show a valid type (not placeholder).
     * Use this before interacting with the dropdown to ensure organization data has loaded.
     */
    async waitForTypeDropdownLoaded() {
      const dropdown = page.getByTestId(studioTestIds.questionTypeDropdown);
      // Wait for dropdown to NOT show placeholder
      await expect(dropdown).not.toContainText('Select type', { timeout: 10000 });
    },

    // ========================================
    // Warning Dialog Actions (Options Loss)
    // Uses shared ConfirmationModal with change_question_type action
    // ========================================

    /**
     * Select a new type that will trigger warning dialog
     * Used when changing FROM a choice type that has options
     */
    async selectTypeWithWarning(typeKey: QuestionTypeKey) {
      const typeName = QUESTION_TYPE_NAMES[typeKey];

      // Click the Question Type dropdown trigger
      const trigger = page.getByTestId(studioTestIds.questionTypeDropdown);
      await trigger.click();

      // Select the option (this should trigger the warning)
      const option = page.getByRole('option', { name: typeName });
      await option.waitFor({ state: 'visible' });
      await option.click();
    },

    /**
     * Expect the type change warning dialog to be visible
     * Validates it's specifically the "Change Question Type" dialog
     */
    async expectWarningDialogVisible() {
      const dialog = page.getByTestId(widgetsTestIds.confirmationModal);
      await expect(dialog).toBeVisible();
      // Verify it's the change question type dialog by checking title
      await expect(page.getByTestId(widgetsTestIds.confirmationModalTitle)).toContainText(
        'Change Question Type'
      );
    },

    /**
     * Expect the type change warning dialog to be hidden
     */
    async expectWarningDialogHidden() {
      const dialog = page.getByTestId(widgetsTestIds.confirmationModal);
      await expect(dialog).toBeHidden();
    },

    /**
     * Verify the warning message contains expected text about options being deleted
     * @param expectedText - Text to look for (e.g., "3 options")
     */
    async expectWarningMessage(expectedText: string) {
      const dialog = page.getByTestId(widgetsTestIds.confirmationModal);
      // The message should mention options being deleted
      await expect(dialog).toContainText(expectedText);
      await expect(dialog).toContainText('permanently delete');
    },

    /**
     * Confirm the type change in the warning dialog
     */
    async confirmTypeChange() {
      const confirmButton = page.getByTestId(widgetsTestIds.confirmationModalConfirmButton);
      await confirmButton.click();
    },

    /**
     * Cancel the type change in the warning dialog
     */
    async cancelTypeChange() {
      const cancelButton = page.getByTestId(widgetsTestIds.confirmationModalCancelButton);
      await cancelButton.click();
    },

    // ========================================
    // Response Block Actions
    // ========================================

    /**
     * Expect the "responses exist" block message
     */
    async expectResponsesBlockMessage(responseCount: number) {
      const message = page.getByTestId(studioTestIds.questionTypeResponsesBlockMessage);
      await expect(message).toBeVisible();
      await expect(message).toContainText(`${responseCount} response`);
    },

    /**
     * Check if the "Delete responses" button is visible
     */
    async expectDeleteResponsesButtonVisible() {
      const button = page.getByTestId(studioTestIds.deleteQuestionResponsesButton);
      await expect(button).toBeVisible();
    },

    /**
     * Click the "Delete responses" button
     */
    async clickDeleteResponses() {
      const button = page.getByTestId(studioTestIds.deleteQuestionResponsesButton);
      await button.click();
    },

    // ========================================
    // Delete Responses Dialog Actions (uses shared ConfirmationModal)
    // ========================================

    /**
     * Expect the delete responses confirmation dialog to be visible
     * Note: Uses shared ConfirmationModal widget
     */
    async expectDeleteResponsesDialogVisible() {
      const dialog = page.getByTestId(widgetsTestIds.confirmationModal);
      await expect(dialog).toBeVisible();
      // Verify it's the delete responses dialog by checking title
      await expect(page.getByTestId(widgetsTestIds.confirmationModalTitle)).toContainText('Delete Responses');
    },

    /**
     * Confirm deletion of responses
     */
    async confirmDeleteResponses() {
      const confirmButton = page.getByTestId(widgetsTestIds.confirmationModalConfirmButton);
      await confirmButton.click();
    },

    /**
     * Cancel deletion of responses
     */
    async cancelDeleteResponses() {
      const cancelButton = page.getByTestId(widgetsTestIds.confirmationModalCancelButton);
      await cancelButton.click();
    },

    // ========================================
    // Options Section Actions
    // ========================================

    /**
     * Get the count of options in the options section
     */
    async getOptionCount(): Promise<number> {
      const optionItems = page.getByTestId(studioTestIds.questionOptionItem);
      return await optionItems.count();
    },

    /**
     * Expect the options section to be hidden
     */
    async expectOptionsHidden() {
      const optionsSection = page.getByTestId(studioTestIds.questionOptionsSection);
      await expect(optionsSection).toBeHidden();
    },

    /**
     * Expect the options section to be visible
     */
    async expectOptionsVisible() {
      const optionsSection = page.getByTestId(studioTestIds.questionOptionsSection);
      await expect(optionsSection).toBeVisible();
    },
  };
}

export type QuestionTypeChangeActions = ReturnType<typeof createQuestionTypeChangeActions>;
