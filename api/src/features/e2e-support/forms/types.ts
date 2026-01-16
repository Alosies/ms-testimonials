/**
 * E2E Form Types
 */

/**
 * Question data returned by the API
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
 * Step data returned by the API
 */
export interface TestStep {
  id: string;
  stepType: 'welcome' | 'question' | 'rating' | 'thank_you';
  stepOrder: number;
  questions: TestQuestion[];
}

/**
 * Full form data returned by the API
 * Tests should use these values for assertions
 */
export interface TestFormResult {
  formId: string;
  formName: string;
  flowId: string;
  steps: TestStep[];
}
