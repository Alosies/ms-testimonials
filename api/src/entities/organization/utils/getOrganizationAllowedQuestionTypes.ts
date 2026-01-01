import { executeGraphQL } from '@/shared/libs/hasura';
import {
  GetOrganizationPlanQuestionTypesDocument,
  type GetOrganizationPlanQuestionTypesQuery,
} from '@/graphql/generated/operations';
import type { AllowedQuestionType } from '../models';

/**
 * Result type for getOrganizationAllowedQuestionTypes
 * Distinguishes between different failure modes for better error handling
 */
export type GetAllowedQuestionTypesResult =
  | { success: true; questionTypes: AllowedQuestionType[] }
  | { success: false; reason: 'query_error'; error: Error }
  | { success: false; reason: 'organization_not_found' }
  | { success: false; reason: 'no_active_plan' };

/**
 * Fetches the allowed question types for an organization based on their active plan.
 *
 * @param organizationId - The organization ID
 * @returns Result object with question types or failure reason
 */
export async function getOrganizationAllowedQuestionTypes(
  organizationId: string
): Promise<GetAllowedQuestionTypesResult> {
  const { data, error } = await executeGraphQL<
    GetOrganizationPlanQuestionTypesQuery,
    { organizationId: string }
  >(GetOrganizationPlanQuestionTypesDocument, { organizationId });

  if (error) {
    console.error('Error fetching organization plan question types:', error);
    return { success: false, reason: 'query_error', error };
  }

  // Check if organization exists
  if (!data?.organizations_by_pk) {
    console.warn(`Organization not found: ${organizationId}`);
    return { success: false, reason: 'organization_not_found' };
  }

  // Extract question types from the organization's active plan
  const activePlan = data.organizations_by_pk.plans?.[0];
  if (!activePlan) {
    console.warn(`No active plan found for organization ${organizationId}`);
    return { success: false, reason: 'no_active_plan' };
  }

  // Flatten question_types junction entries to question_type objects
  const questionTypes = activePlan.plan.question_types.map((pqt) => pqt.question_type);

  return { success: true, questionTypes };
}
