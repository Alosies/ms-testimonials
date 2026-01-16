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
  stepType: 'welcome' | 'question' | 'rating' | 'thank_you' | 'consent' | 'contact_info' | 'reward';
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
 * Full form data returned by the API
 * Tests should use these values for assertions
 */
export interface TestFormResult {
  formId: string;
  formName: string;
  flowId: string;
  steps: TestStep[];
}

/**
 * Branched form data returned by the API
 * Includes multiple flows for branch testing
 */
export interface TestBranchedFormResult {
  formId: string;
  formName: string;
  /** Shared flow (before branch point) */
  sharedFlow: TestFlow;
  /** Testimonial flow (rating >= threshold) */
  testimonialFlow: TestFlow;
  /** Improvement flow (rating < threshold) */
  improvementFlow: TestFlow;
  /** All steps flattened for easy access */
  allSteps: TestStep[];
  /** The rating question that serves as branch point */
  branchQuestionId: string;
}
