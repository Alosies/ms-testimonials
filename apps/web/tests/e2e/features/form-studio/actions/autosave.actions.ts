/**
 * Studio Auto-Save Actions
 *
 * Actions for testing auto-save functionality in the step editor.
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';

/**
 * Welcome step field identifiers (match the input IDs in WelcomeStepEditor.vue)
 */
export const WELCOME_STEP_FIELDS = {
  title: 'title',
  subtitle: 'subtitle',
  buttonText: 'buttonText',
} as const;

export type WelcomeStepField = keyof typeof WELCOME_STEP_FIELDS;

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
  };
}

export type AutoSaveActions = ReturnType<typeof createAutoSaveActions>;
