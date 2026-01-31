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
 * Question option data returned by the E2E API
 */
export interface TestQuestionOption {
  id: string;
  questionId: string;
  optionValue: string;
  optionLabel: string;
  displayOrder: number;
  isDefault: boolean;
}

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
  /** Options for choice-type questions */
  options?: TestQuestionOption[];
  /** Question type unique name (e.g., 'text_long', 'choice_single') - convenience for tests */
  questionType?: string;
  /** Number of responses for this question - for response blocking tests */
  responseCount?: number;
}

/**
 * Step data returned by the E2E API
 */
export interface TestStep {
  id: string;
  stepType: 'welcome' | 'question' | 'rating' | 'thank_you' | 'consent' | 'contact_info' | 'reward' | 'testimonial_write';
  stepOrder: number;
  questions: TestQuestion[];
  /** Flow membership for branched forms */
  flowMembership?: 'shared' | 'testimonial' | 'improvement';
  /** Flow ID this step belongs to */
  flowId?: string;
  /** Convenience property: first question in the step (for steps that have one question) */
  question?: TestQuestion;
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
  /** Public URL for customer-facing form (e.g., "/f/form-name_abc123") */
  publicUrl: string;
  orgSlug: string;
  /** Shared flow (before branch point) */
  sharedFlow: TestFlow;
  /** Testimonial flow (rating >= 4) */
  testimonialFlow: TestFlow;
  /** Improvement flow (rating < 4) */
  improvementFlow: TestFlow;
  /** Outro flow (shared steps after branches: contact_info, thank_you) */
  outroFlow: TestFlow;
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
  outroFlow: TestFlow;
  allSteps: TestStep[];
  branchQuestionId: string;
}

/**
 * Choice question step with extended question data
 * Includes question type name for easier test assertions
 */
export interface TestChoiceQuestionStep extends TestStep {
  /** The choice question with its options and type info */
  question: TestQuestion & {
    questionType: string;
    options: TestQuestionOption[];
  };
}

/**
 * Choice question form data for E2E tests
 *
 * Contains a branched form structure with a choice_single question
 * and its predefined options.
 */
export interface TestChoiceQuestionFormData {
  id: string;
  name: string;
  studioUrl: string;
  orgSlug: string;
  /** Shared flow containing the choice question */
  sharedFlow: TestFlow;
  /** Testimonial flow (rating >= 4) */
  testimonialFlow: TestFlow;
  /** Improvement flow (rating < 4) */
  improvementFlow: TestFlow;
  /** All steps flattened for easy access */
  allSteps: TestStep[];
  /** The rating question that serves as branch point */
  branchQuestionId: string;
  /** The choice question ID */
  choiceQuestionId: string;
}

/**
 * Response from E2E API choice question form creation
 */
export interface CreateChoiceQuestionFormResponse {
  formId: string;
  formName: string;
  studioUrl: string;
  sharedFlow: TestFlow;
  testimonialFlow: TestFlow;
  improvementFlow: TestFlow;
  allSteps: TestStep[];
  branchQuestionId: string;
  choiceQuestionId: string;
}

/**
 * Form with responses data for E2E tests
 *
 * Contains a form with a question step that has mock responses.
 * Used for testing workflows that depend on response count.
 * Uses branched form structure for consistency with other fixtures.
 */
export interface TestFormWithResponsesData {
  id: string;
  name: string;
  studioUrl: string;
  orgSlug: string;
  /** The primary flow ID */
  flowId: string;
  /** All steps in the form (flat) */
  steps: TestStep[];
  /** Shared flow containing all steps */
  sharedFlow: TestFlow;
  /** The question that has responses */
  questionId: string;
  /** Number of responses created for the question */
  responseCount: number;
}

/**
 * Response from E2E API responses creation
 */
export interface CreateResponsesResponse {
  created: number;
}
