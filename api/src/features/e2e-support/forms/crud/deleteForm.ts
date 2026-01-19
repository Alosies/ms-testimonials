import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import {
  SoftDeleteTestFormDocument,
  CleanupOldTestFormsDocument,
  type SoftDeleteTestFormMutation,
  type CleanupOldTestFormsMutation,
} from '@/graphql/generated/operations';

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
