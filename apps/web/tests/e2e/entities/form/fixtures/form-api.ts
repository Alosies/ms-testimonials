/**
 * Form API Fixtures
 *
 * CRUD operations for test forms via the E2E API.
 * The API uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID
 * from environment variables - no org lookup needed.
 */
import { testApiRequest } from '../../../shared';
import { createEntityUrlSlug } from '@/shared/urls';
import type { CreateFormResponse, CreateBranchedFormResponse, TestFormData, TestBranchedFormData } from '../types';

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
