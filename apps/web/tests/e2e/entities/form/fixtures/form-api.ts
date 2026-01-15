/**
 * Form API Fixtures
 *
 * CRUD operations for test forms via the E2E API.
 * The API uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID
 * from environment variables - no org lookup needed.
 */
import { testApiRequest } from '../../../shared';
import { createEntityUrlSlug } from '@/shared/urls';
import type { CreateFormResponse, TestFormData } from '../types';

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
