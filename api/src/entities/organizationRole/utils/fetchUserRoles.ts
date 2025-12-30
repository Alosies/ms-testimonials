import { executeGraphQL } from '@/shared/libs/hasura';
import { FetchUserRolesDocument } from '@/graphql/generated/operations';
import type { OrganizationRole } from '../models';

/**
 * Fetch all roles for a user across all organizations
 */
export async function fetchUserRoles(userId: string): Promise<OrganizationRole[] | null> {
  const { data, error } = await executeGraphQL<
    { organization_roles: OrganizationRole[] },
    { userId: string }
  >(FetchUserRolesDocument, { userId });

  if (error) {
    console.error('Error fetching user roles:', error);
    return null;
  }

  return data?.organization_roles || [];
}
