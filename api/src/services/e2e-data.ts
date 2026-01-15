import { nanoid } from 'nanoid';
import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  // Form operations
  CreateTestFormDocument,
  SoftDeleteTestFormDocument,
  CleanupOldTestFormsDocument,
  // Flow operations
  CreateTestFlowDocument,
  // Step operations
  CreateTestFormStepDocument,
  // Question operations
  CreateTestFormQuestionDocument,
  // Types
  type CreateTestFormMutation,
  type SoftDeleteTestFormMutation,
  type CleanupOldTestFormsMutation,
  type CreateTestFlowMutation,
  type CreateTestFormStepMutation,
  type CreateTestFormQuestionMutation,
} from '@/graphql/generated/operations';

/**
 * Test data service for E2E testing
 *
 * Creates and manages test forms with steps and questions.
 * All operations use admin client to bypass RLS.
 * User/org IDs come from environment variables - no DB lookups needed.
 */

// ============================================================================
// Types
// ============================================================================

interface TestFormResult {
  formId: string;
  flowId: string;
  stepIds: string[];
  questionIds: string[];
}

// Question type IDs from database (seed data)
const QUESTION_TYPE_IDS = {
  TEXT_SHORT: '4bi1NP57H4eV',
  TEXT_LONG: 'kZhx89QTM2ts',
  RATING_STAR: 'wCbQ9s81jyS2',
} as const;

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Create a test form with a flow, steps, and questions
 *
 * Creates a complete form structure suitable for E2E testing:
 * - 1 form with "E2E Test Form" prefix
 * - 1 primary flow
 * - 3 steps: welcome, rating, thank_you
 * - 1 rating question on the rating step
 *
 * @param organizationId - Organization ID (from TEST_ORGANIZATION_ID env var)
 * @param name - Form name (will be prefixed with "E2E Test Form - ")
 * @param createdBy - User ID (from TEST_USER_ID env var)
 * @returns Object containing all created entity IDs
 */
export async function createTestFormWithSteps(
  organizationId: string,
  name: string,
  createdBy: string
): Promise<TestFormResult> {
  // Generate IDs upfront for all entities
  const formId = nanoid(12);
  const flowId = nanoid(12);
  const welcomeStepId = nanoid(12);
  const questionStepId = nanoid(12);
  const thankYouStepId = nanoid(12);
  const ratingQuestionId = nanoid(12);

  const formName = `E2E Test Form - ${name}`;

  // 1. Create the form
  const { error: formError } = await executeGraphQLAsAdmin<CreateTestFormMutation>(CreateTestFormDocument, {
    id: formId,
    organization_id: organizationId,
    name: formName,
    status: 'draft',
    created_by: createdBy,
    product_name: 'Test Product',
    product_description: 'A test product for E2E testing',
  });

  if (formError) {
    throw new Error(`Failed to create test form: ${formError.message}`);
  }

  // 2. Create the primary flow
  const { error: flowError } = await executeGraphQLAsAdmin<CreateTestFlowMutation>(CreateTestFlowDocument, {
    id: flowId,
    form_id: formId,
    organization_id: organizationId,
    name: 'Main Flow',
    flow_type: 'shared',
    is_primary: true,
    display_order: 0,
  });

  if (flowError) {
    throw new Error(`Failed to create test flow: ${flowError.message}`);
  }

  // 3. Create steps
  // Welcome step
  await executeGraphQLAsAdmin<CreateTestFormStepMutation>(CreateTestFormStepDocument, {
    id: welcomeStepId,
    flow_id: flowId,
    organization_id: organizationId,
    step_type: 'welcome',
    step_order: 0,
    is_active: true,
  });

  // Rating step
  await executeGraphQLAsAdmin<CreateTestFormStepMutation>(CreateTestFormStepDocument, {
    id: questionStepId,
    flow_id: flowId,
    organization_id: organizationId,
    step_type: 'rating',
    step_order: 1,
    is_active: true,
  });

  // Thank you step
  await executeGraphQLAsAdmin<CreateTestFormStepMutation>(CreateTestFormStepDocument, {
    id: thankYouStepId,
    flow_id: flowId,
    organization_id: organizationId,
    step_type: 'thank_you',
    step_order: 2,
    is_active: true,
  });

  // 4. Create a rating question on the rating step
  await executeGraphQLAsAdmin<CreateTestFormQuestionMutation>(CreateTestFormQuestionDocument, {
    id: ratingQuestionId,
    step_id: questionStepId,
    organization_id: organizationId,
    question_type_id: QUESTION_TYPE_IDS.RATING_STAR,
    question_text: 'How would you rate your experience?',
    question_key: 'experience_rating',
    display_order: 1,
    is_required: true,
    is_active: true,
  });

  return {
    formId,
    flowId,
    stepIds: [welcomeStepId, questionStepId, thankYouStepId],
    questionIds: [ratingQuestionId],
  };
}

/**
 * Soft delete a test form by setting is_active to false
 *
 * @param formId - Form ID to soft delete
 * @returns true if form was deleted, false otherwise
 */
export async function deleteTestForm(formId: string): Promise<boolean> {
  const { data, error } = await executeGraphQLAsAdmin<SoftDeleteTestFormMutation>(
    SoftDeleteTestFormDocument,
    { id: formId }
  );

  if (error) {
    console.error('Error deleting test form:', error);
    return false;
  }

  return data?.update_forms_by_pk !== null && data?.update_forms_by_pk?.is_active === false;
}

/**
 * Clean up old E2E test data by soft-deleting forms older than specified hours
 *
 * Only affects forms with names starting with "E2E Test Form"
 *
 * @param organizationId - Organization ID to clean up
 * @param olderThanHours - Delete forms older than this many hours (default: 24)
 * @returns Number of forms soft-deleted
 */
export async function cleanupTestData(
  organizationId: string,
  olderThanHours: number = 24
): Promise<number> {
  const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await executeGraphQLAsAdmin<CleanupOldTestFormsMutation>(
    CleanupOldTestFormsDocument,
    {
      organization_id: organizationId,
      cutoff_time: cutoffTime,
    }
  );

  if (error) {
    console.error('Error cleaning up test data:', error);
    return 0;
  }

  return data?.update_forms?.affected_rows ?? 0;
}
