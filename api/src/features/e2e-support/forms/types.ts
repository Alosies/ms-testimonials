/**
 * E2E Form Types
 */

/**
 * Question option data returned by the API
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
  /** Options for choice-type questions */
  options?: TestQuestionOption[];
  /** Question type unique name (e.g., 'text_long', 'choice_single') - convenience for tests */
  questionType?: string;
  /** Number of responses for this question - for response blocking tests */
  responseCount?: number;
}

/**
 * Step data returned by the API
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
  /** Outro flow (shared steps after branches: contact_info, thank_you) */
  outroFlow: TestFlow;
  /** All steps flattened for easy access */
  allSteps: TestStep[];
  /** The rating question that serves as branch point */
  branchQuestionId: string;
}

/**
 * Choice question step data for E2E tests
 * Contains the question with its options
 */
export interface TestChoiceQuestionStep {
  id: string;
  stepType: 'question';
  stepOrder: number;
  /** The choice question with its options */
  question: TestQuestion & {
    questionType: string;
    options: TestQuestionOption[];
  };
  flowMembership: 'shared' | 'testimonial' | 'improvement';
  flowId: string;
}

/**
 * Choice question form data returned by the API
 * Uses branched form structure for compatibility with existing tests
 */
export interface TestChoiceQuestionFormResult {
  formId: string;
  formName: string;
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
