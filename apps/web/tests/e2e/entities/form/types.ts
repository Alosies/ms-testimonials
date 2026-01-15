/**
 * Form Entity Types for E2E Tests
 *
 * Type definitions for form-related test data.
 * Matches the structure returned by the E2E API.
 *
 * These types mirror the API response so tests can use actual
 * created values for assertions (factory pattern).
 */

/**
 * Question data returned by the E2E API
 */
export interface TestQuestion {
  id: string;
  stepId: string;
  questionText: string;
  questionKey: string;
  questionTypeId: string;
  displayOrder: number;
  isRequired: boolean;
}

/**
 * Step data returned by the E2E API
 */
export interface TestStep {
  id: string;
  stepType: 'welcome' | 'question' | 'rating' | 'thank_you';
  stepOrder: number;
  questions: TestQuestion[];
}

/**
 * Full form data returned by fixtures
 *
 * Contains all created data so tests can assert against actual values.
 * Note: `flowId` and `steps` are only available for forms created via API.
 * Forms created via UI (formViaUi) won't have this data.
 *
 * @example
 * ```ts
 * test('question text visible', async ({ formViaApi }) => {
 *   const ratingStep = formViaApi.steps?.find(s => s.stepType === 'rating');
 *   const question = ratingStep?.questions[0];
 *   await expect(page.getByText(question.questionText)).toBeVisible();
 * });
 * ```
 */
export interface TestFormData {
  id: string;
  name: string;
  studioUrl: string;
  orgSlug: string;
  /** Only available for forms created via API */
  flowId?: string;
  /** Only available for forms created via API */
  steps?: TestStep[];
}

/**
 * Response from E2E API form creation
 */
export interface CreateFormResponse {
  formId: string;
  formName: string;
  flowId: string;
  studioUrl: string;
  steps: TestStep[];
}
