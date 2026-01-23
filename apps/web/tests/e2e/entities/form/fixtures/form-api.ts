/**
 * Form API Fixtures
 *
 * CRUD operations for test forms via the E2E API.
 * The API uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID
 * from environment variables - no org lookup needed.
 */
import { testApiRequest } from '../../../shared';
import { createEntityUrlSlug, createPublicFormUrl } from '@/shared/urls';
import type {
  CreateFormResponse,
  CreateBranchedFormResponse,
  CreateChoiceQuestionFormResponse,
  CreateResponsesResponse,
  TestFormData,
  TestBranchedFormData,
  TestChoiceQuestionFormData,
  TestFormWithResponsesData,
} from '../types';

/**
 * Create a test form via E2E API.
 *
 * This is the fast path for creating test forms - bypasses UI and AI generation.
 * Creates a form with 3 steps: Welcome, Rating, Thank You.
 *
 * Returns full data including steps and questions so tests can assert
 * against actual created values (factory pattern).
 *
 * @param orgSlug - Organization slug (for building studioUrl)
 * @param name - Optional form name (defaults to timestamped name)
 * @returns Full form data including steps and questions
 *
 * @example
 * ```ts
 * const form = await createTestForm('my-org');
 * await page.goto(form.studioUrl);
 *
 * // Assert using actual created data
 * const ratingStep = form.steps.find(s => s.stepType === 'rating');
 * await expect(page.getByText(ratingStep.questions[0].questionText)).toBeVisible();
 * ```
 */
export async function createTestForm(
  orgSlug: string,
  name?: string
): Promise<TestFormData> {
  const formName = name || `E2E Fast Test ${Date.now()}`;

  const result = await testApiRequest<CreateFormResponse>('POST', '/forms', {
    name: formName,
  });

  // Build studioUrl using the same URL pattern the app uses
  // Format: /{orgSlug}/forms/{slugified-name}_{formId}/studio
  const urlSlug = createEntityUrlSlug(result.formName, result.formId);
  const studioUrl = `/${orgSlug}/forms/${urlSlug}/studio`;

  return {
    id: result.formId,
    name: result.formName,
    studioUrl,
    orgSlug,
    flowId: result.flowId,
    steps: result.steps,
  };
}

/**
 * Create a test form with branching via E2E API.
 *
 * Creates a form with multiple flows for testing branched navigation:
 * - Shared flow: welcome, question, rating (branch point)
 * - Testimonial flow: question, consent, thank_you (rating >= 4)
 * - Improvement flow: question, thank_you (rating < 4)
 *
 * @param orgSlug - Organization slug (for building studioUrl)
 * @param name - Optional form name (defaults to timestamped name)
 * @returns Full branched form data including all flows and steps
 *
 * @example
 * ```ts
 * const form = await createTestBranchedForm('my-org');
 * await page.goto(form.studioUrl);
 *
 * // Navigate to testimonial flow steps
 * const testimonialStep = form.testimonialFlow.steps[0];
 * await page.locator(`[data-step-id="${testimonialStep.id}"]`).click();
 * ```
 */
export async function createTestBranchedForm(
  orgSlug: string,
  name?: string
): Promise<TestBranchedFormData> {
  const formName = name || `E2E Branched Test ${Date.now()}`;

  const result = await testApiRequest<CreateBranchedFormResponse>('POST', '/forms/branched', {
    name: formName,
  });

  // Build studioUrl using the same URL pattern the app uses
  const urlSlug = createEntityUrlSlug(result.formName, result.formId);
  const studioUrl = `/${orgSlug}/forms/${urlSlug}/studio`;

  // Build publicUrl for customer-facing form (/f/{name}_{id})
  const publicUrl = createPublicFormUrl(result.formName, result.formId);

  return {
    id: result.formId,
    name: result.formName,
    studioUrl,
    publicUrl,
    orgSlug,
    sharedFlow: result.sharedFlow,
    testimonialFlow: result.testimonialFlow,
    improvementFlow: result.improvementFlow,
    allSteps: result.allSteps,
    branchQuestionId: result.branchQuestionId,
  };
}

/**
 * Create a test form with a choice_single question via E2E API.
 *
 * Creates a branched form with a choice question containing 3-4 predefined options:
 * - Shared flow: welcome, choice question, rating (branch point)
 * - Testimonial flow: question, consent, thank_you (rating >= 4)
 * - Improvement flow: question, thank_you (rating < 4)
 *
 * The choice question has options for testing the question type change
 * workflow with options deletion.
 *
 * @param orgSlug - Organization slug (for building studioUrl)
 * @param name - Optional form name (defaults to timestamped name)
 * @returns Full form data including choice question with options
 *
 * @example
 * ```ts
 * const form = await createTestChoiceQuestionForm('my-org');
 * await page.goto(form.studioUrl);
 *
 * // Find the choice question step
 * const choiceStep = form.sharedFlow.steps.find(
 *   s => s.stepType === 'question' && s.questions[0]?.options?.length
 * );
 * ```
 */
export async function createTestChoiceQuestionForm(
  orgSlug: string,
  name?: string
): Promise<TestChoiceQuestionFormData> {
  const formName = name || `E2E Choice Question Test ${Date.now()}`;

  const result = await testApiRequest<CreateChoiceQuestionFormResponse>('POST', '/forms/choice-question', {
    name: formName,
  });

  // Build studioUrl using the same URL pattern the app uses
  const urlSlug = createEntityUrlSlug(result.formName, result.formId);
  const studioUrl = `/${orgSlug}/forms/${urlSlug}/studio`;

  return {
    id: result.formId,
    name: result.formName,
    studioUrl,
    orgSlug,
    sharedFlow: result.sharedFlow,
    testimonialFlow: result.testimonialFlow,
    improvementFlow: result.improvementFlow,
    allSteps: result.allSteps,
    branchQuestionId: result.branchQuestionId,
    choiceQuestionId: result.choiceQuestionId,
  };
}

/**
 * Create a test form with mock responses via E2E API.
 *
 * Creates a standard form (welcome, rating, thank_you) and then
 * creates the specified number of mock responses for the rating question.
 *
 * This is useful for testing:
 * - Question type change workflows that check for existing responses
 * - Response deletion confirmations
 * - Response count displays
 *
 * @param orgSlug - Organization slug (for building studioUrl)
 * @param options - Optional configuration
 * @param options.name - Form name (defaults to timestamped name)
 * @param options.responseCount - Number of responses to create (default: 3)
 * @returns Full form data including responseCount for assertions
 *
 * @example
 * ```ts
 * const form = await createTestFormWithResponses('my-org', { responseCount: 5 });
 * await page.goto(form.studioUrl);
 *
 * // The rating question has 5 responses
 * expect(form.responseCount).toBe(5);
 * ```
 */
export async function createTestFormWithResponses(
  orgSlug: string,
  options?: { name?: string; responseCount?: number }
): Promise<TestFormWithResponsesData> {
  const formName = options?.name || `E2E Form With Responses ${Date.now()}`;
  const responseCount = options?.responseCount ?? 3;

  // First create the form
  const result = await testApiRequest<CreateFormResponse>('POST', '/forms', {
    name: formName,
  });

  // Find the question step to add responses to (prefer 'question' type, fallback to 'rating')
  const questionStep = result.steps.find((s) => s.stepType === 'question')
    || result.steps.find((s) => s.stepType === 'rating');
  if (!questionStep || questionStep.questions.length === 0) {
    throw new Error('Created form does not have a question step with questions');
  }

  const questionId = questionStep.questions[0].id;

  // Create mock responses for the question
  const responsesResult = await testApiRequest<CreateResponsesResponse>('POST', '/form-responses', {
    questionId,
    count: responseCount,
  });

  // Build studioUrl using the same URL pattern the app uses
  const urlSlug = createEntityUrlSlug(result.formName, result.formId);
  const studioUrl = `/${orgSlug}/forms/${urlSlug}/studio`;

  // Enhance the step with convenience properties for tests
  const enhancedSteps = result.steps.map((step) => {
    if (step.questions.length > 0) {
      const enhancedQuestions = step.questions.map((q) => ({
        ...q,
        // Add responseCount to the question that has responses
        responseCount: q.id === questionId ? responsesResult.created : 0,
      }));
      return {
        ...step,
        questions: enhancedQuestions,
        // Add convenience 'question' property (first question)
        question: enhancedQuestions[0],
      };
    }
    return step;
  });

  // Build sharedFlow wrapper for test consistency
  const sharedFlow = {
    id: result.flowId,
    name: 'Shared Steps',
    flowType: 'shared' as const,
    isPrimary: true,
    displayOrder: 0,
    steps: enhancedSteps,
  };

  return {
    id: result.formId,
    name: result.formName,
    studioUrl,
    orgSlug,
    flowId: result.flowId,
    steps: enhancedSteps,
    sharedFlow,
    questionId,
    responseCount: responsesResult.created,
  };
}

/**
 * Delete a test form via Test API.
 *
 * @param formId - Form ID to delete
 *
 * @example
 * ```ts
 * await deleteTestForm(form.id);
 * ```
 */
export async function deleteTestForm(formId: string): Promise<void> {
  await testApiRequest('DELETE', `/forms/${formId}`);
}
