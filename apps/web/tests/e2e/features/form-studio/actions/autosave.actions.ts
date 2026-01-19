/**
 * Studio Auto-Save Actions
 *
 * Actions for testing auto-save functionality in the step editor.
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import { studioTestIds } from '@/shared/constants/testIds';

/**
 * Welcome step field identifiers (match the input IDs in WelcomeStepEditor.vue)
 */
export const WELCOME_STEP_FIELDS = {
  title: 'title',
  subtitle: 'subtitle',
  buttonText: 'buttonText',
} as const;

export type WelcomeStepField = keyof typeof WELCOME_STEP_FIELDS;

/**
 * Question step text field identifiers (match the input IDs in QuestionStepEditor.vue)
 */
export const QUESTION_STEP_TEXT_FIELDS = {
  questionText: 'questionText',
  placeholder: 'placeholder',
  helpText: 'helpText',
} as const;

export type QuestionStepTextField = keyof typeof QUESTION_STEP_TEXT_FIELDS;

/**
 * Question type options available in the dropdown
 * Maps internal type IDs to their display names in the UI
 */
export const QUESTION_TYPE_OPTIONS = {
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

export type QuestionTypeId = keyof typeof QUESTION_TYPE_OPTIONS;

/**
 * Rating step field identifiers mapped to data-testid values
 */
export const RATING_STEP_FIELDS = {
  ratingQuestion: studioTestIds.ratingQuestionInput,
  lowLabel: studioTestIds.ratingLowLabelInput,
  highLabel: studioTestIds.ratingHighLabelInput,
  helpText: studioTestIds.ratingHelpTextInput,
} as const;

export type RatingStepField = keyof typeof RATING_STEP_FIELDS;

/**
 * Consent step field identifiers mapped to data-testid values
 */
export const CONSENT_STEP_FIELDS = {
  title: studioTestIds.consentTitleInput,
  description: studioTestIds.consentDescriptionInput,
  publicLabel: studioTestIds.consentPublicLabelInput,
  publicDescription: studioTestIds.consentPublicDescriptionInput,
  privateLabel: studioTestIds.consentPrivateLabelInput,
  privateDescription: studioTestIds.consentPrivateDescriptionInput,
} as const;

export type ConsentStepField = keyof typeof CONSENT_STEP_FIELDS;

/**
 * Thank You step field identifiers mapped to data-testid values
 */
export const THANKYOU_STEP_FIELDS = {
  title: studioTestIds.thankYouTitleInput,
  message: studioTestIds.thankYouMessageInput,
  redirectUrl: studioTestIds.thankYouRedirectUrlInput,
} as const;

export type ThankYouStepField = keyof typeof THANKYOU_STEP_FIELDS;

export function createAutoSaveActions(studio: StudioPage) {
  const { page } = studio;

  return {
    /**
     * Fill a Welcome step field
     */
    async fillWelcomeField(field: WelcomeStepField, value: string) {
      const fieldId = WELCOME_STEP_FIELDS[field];
      const input = page.locator(`#${fieldId}`);
      await input.fill(value);
    },

    /**
     * Fill a Question step text field (questionText, placeholder, helpText)
     */
    async fillQuestionTextField(field: QuestionStepTextField, value: string) {
      const fieldId = QUESTION_STEP_TEXT_FIELDS[field];
      const input = page.locator(`#${fieldId}`);
      await input.fill(value);
    },

    /**
     * Select a question type from the dropdown
     * Uses testId for more reliable selection
     */
    async selectQuestionType(typeId: QuestionTypeId) {
      const typeName = QUESTION_TYPE_OPTIONS[typeId];
      // Click the Question Type dropdown trigger using testId
      const trigger = page.getByTestId(studioTestIds.questionTypeDropdown);
      await trigger.click();
      // Wait for listbox to appear and select the option
      const option = page.getByRole('option', { name: typeName });
      await option.waitFor({ state: 'visible' });
      await option.click();
      // Wait for the dropdown to close and type change to process
      await page.waitForTimeout(500);
    },

    /**
     * Get the current question type from the dropdown
     * Returns the display name (e.g., "Paragraph", "Star rating")
     */
    async getQuestionType(): Promise<string> {
      const trigger = page.getByTestId(studioTestIds.questionTypeDropdown);
      const text = await trigger.textContent();
      return text?.trim() ?? '';
    },

    /**
     * Toggle the Required switch
     */
    async toggleRequired() {
      const requiredSwitch = page.getByRole('switch');
      await requiredSwitch.click();
    },

    /**
     * Get the current state of the Required switch
     */
    async getRequiredState(): Promise<boolean> {
      const requiredSwitch = page.getByRole('switch');
      const checked = await requiredSwitch.getAttribute('aria-checked');
      return checked === 'true';
    },

    /**
     * Close the step editor panel and wait for auto-save to complete
     */
    async closeEditorAndWaitForSave() {
      // Wait for auto-save debounce and network request
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
      await studio.expectStepEditorHidden();
      // Additional wait to ensure save completes
      await page.waitForTimeout(1000);
    },

    // ========================================
    // Rating Step Actions
    // ========================================

    /**
     * Fill a Rating step text field using data-testid
     * Blurs after fill to ensure Vue v-model update is triggered
     */
    async fillRatingTextField(field: RatingStepField, value: string) {
      const testId = RATING_STEP_FIELDS[field];
      const input = page.getByTestId(testId);
      await input.fill(value);
      await input.blur();
    },

    /**
     * Get the current state of the Rating Required switch
     */
    async getRatingRequiredState(): Promise<boolean> {
      const requiredSwitch = page.getByTestId(studioTestIds.ratingRequiredSwitch);
      const checked = await requiredSwitch.getAttribute('aria-checked');
      return checked === 'true';
    },

    /**
     * Toggle the Rating Required switch
     */
    async toggleRatingRequired() {
      const requiredSwitch = page.getByTestId(studioTestIds.ratingRequiredSwitch);
      await requiredSwitch.click();
    },

    // ========================================
    // Consent Step Actions
    // ========================================

    /**
     * Fill a Consent step field using data-testid
     */
    async fillConsentField(field: ConsentStepField, value: string) {
      const testId = CONSENT_STEP_FIELDS[field];
      const input = page.getByTestId(testId);
      await input.fill(value);
    },

    /**
     * Get the current state of the Consent Required switch
     */
    async getConsentRequiredState(): Promise<boolean> {
      const requiredSwitch = page.getByTestId(studioTestIds.consentRequiredSwitch);
      const checked = await requiredSwitch.getAttribute('aria-checked');
      return checked === 'true';
    },

    /**
     * Toggle the Consent Required switch
     */
    async toggleConsentRequired() {
      const requiredSwitch = page.getByTestId(studioTestIds.consentRequiredSwitch);
      await requiredSwitch.click();
    },

    // ========================================
    // Thank You Step Actions
    // ========================================

    /**
     * Fill a Thank You step field using data-testid
     */
    async fillThankYouField(field: ThankYouStepField, value: string) {
      const testId = THANKYOU_STEP_FIELDS[field];
      const input = page.getByTestId(testId);
      await input.fill(value);
    },
  };
}

export type AutoSaveActions = ReturnType<typeof createAutoSaveActions>;
