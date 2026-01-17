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
  stepType: 'welcome' | 'question' | 'rating' | 'thank_you' | 'consent';
  stepOrder: number;
  questions: TestQuestion[];
  /** Flow membership for branched forms */
  flowMembership?: 'shared' | 'testimonial' | 'improvement';
  /** Flow ID this step belongs to */
  flowId?: string;
}

/**
 * Flow data for branched forms
 */
export interface TestFlow {
  id: string;
  name: string;
  flowType: 'shared' | 'branch';
  isPrimary: boolean;
  displayOrder: number;
  steps: TestStep[];
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

/**
 * Branched form data for E2E tests
 *
 * Contains all flows and steps for testing navigation in branched forms.
 */
export interface TestBranchedFormData {
  id: string;
  name: string;
  studioUrl: string;
  orgSlug: string;
  /** Shared flow (before branch point) */
  sharedFlow: TestFlow;
  /** Testimonial flow (rating >= 4) */
  testimonialFlow: TestFlow;
  /** Improvement flow (rating < 4) */
  improvementFlow: TestFlow;
  /** All steps flattened for easy access */
  allSteps: TestStep[];
  /** The rating question that serves as branch point */
  branchQuestionId: string;
}

/**
 * Response from E2E API branched form creation
 */
export interface CreateBranchedFormResponse {
  formId: string;
  formName: string;
  studioUrl: string;
  sharedFlow: TestFlow;
  testimonialFlow: TestFlow;
  improvementFlow: TestFlow;
  allSteps: TestStep[];
  branchQuestionId: string;
}
