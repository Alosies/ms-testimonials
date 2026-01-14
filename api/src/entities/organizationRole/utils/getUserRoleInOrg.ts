import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FetchUserRoleInOrgDocument } from '@/graphql/generated/operations';
import type { OrganizationRole } from '../models';

/**
 * Get user's role in a specific organization
 */
export async function getUserRoleInOrg(
  userId: string,
  organizationId: string
): Promise<OrganizationRole | null> {
  const { data, error } = await executeGraphQLAsAdmin<
    { organization_roles: OrganizationRole[] },
    { userId: string; organizationId: string }
  >(FetchUserRoleInOrgDocument, { userId, organizationId });

  if (error) {
    console.error('Error fetching user role in org:', error);
    return null;
  }

  return data?.organization_roles[0] || null;
}
