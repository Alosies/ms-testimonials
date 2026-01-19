import type { Context } from 'hono';
import { env } from '@/shared/config/env';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  GetFormQuestionFormIdDocument,
  CreateTestFormSubmissionDocument,
  CreateTestFormQuestionResponseDocument,
  type GetFormQuestionFormIdQuery,
  type CreateTestFormSubmissionMutation,
  type CreateTestFormQuestionResponseMutation,
} from '@/graphql/generated/operations';

/**
 * POST /e2e/form-responses
 * Create mock form question responses for E2E testing
 *
 * Creates specified number of mock responses for a question.
 * Each response requires a submission, so submissions are created automatically.
 *
 * Uses pre-configured E2E_ORGANIZATION_ID from environment.
 *
 * Request body:
 * - questionId: string - The question ID to create responses for
 * - count: number - Number of responses to create (default: 1)
 * - organizationId?: string - Optional org ID (defaults to E2E_ORGANIZATION_ID)
 *
 * Returns:
 * - { created: number } - Number of responses created
 */
export async function createFormResponses(c: Context) {
  try {
    const body = await c.req.json();
    const { questionId, count = 1, organizationId } = body;

    if (!questionId || typeof questionId !== 'string') {
      return c.json({ error: 'questionId is required' }, 400);
    }

    if (typeof count !== 'number' || count < 1 || count > 100) {
      return c.json({ error: 'count must be a number between 1 and 100' }, 400);
    }

    const orgId = organizationId || env.E2E_ORGANIZATION_ID;

    console.log(`[E2E] Creating ${count} form responses for question ${questionId}`);

    // Get the form ID from the question to create valid submissions
    const { data: questionData, error: questionError } = await executeGraphQLAsAdmin<GetFormQuestionFormIdQuery>(
      GetFormQuestionFormIdDocument,
      { question_id: questionId }
    );

    if (questionError || !questionData?.form_questions_by_pk) {
      console.error('[E2E] Failed to find question:', questionError);
      return c.json({ error: 'Question not found' }, 404);
    }

    const formId = questionData.form_questions_by_pk.step?.flow?.form_id;
    if (!formId) {
      return c.json({ error: 'Question is not linked to a form' }, 400);
    }

    let created = 0;

    for (let i = 0; i < count; i++) {
      // Create a submission for each response
      const { data: submissionData, error: submissionError } = await executeGraphQLAsAdmin<CreateTestFormSubmissionMutation>(
        CreateTestFormSubmissionDocument,
        {
          organization_id: orgId,
          form_id: formId,
        }
      );

      if (submissionError || !submissionData?.insert_form_submissions_one?.id) {
        console.error('[E2E] Failed to create submission:', submissionError);
        continue;
      }

      const submissionId = submissionData.insert_form_submissions_one.id;

      // Create the response with mock data
      const { data: responseData, error: responseError } = await executeGraphQLAsAdmin<CreateTestFormQuestionResponseMutation>(
        CreateTestFormQuestionResponseDocument,
        {
          organization_id: orgId,
          submission_id: submissionId,
          question_id: questionId,
          answer_text: `Mock response ${i + 1}`,
        }
      );

      if (responseError || !responseData?.insert_form_question_responses_one?.id) {
        console.error('[E2E] Failed to create response:', responseError);
        continue;
      }

      created++;
    }

    console.log(`[E2E] Created ${created} form responses for question ${questionId}`);

    return c.json({ created }, 201);
  } catch (error) {
    console.error('[E2E] Create form responses error:', error);
    return c.json({ error: 'Failed to create form responses' }, 500);
  }
}
