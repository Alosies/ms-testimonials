import type { OrganizationRole } from '../models';

/**
 * Build the list of allowed roles for Hasura JWT claims
 * Includes all unique role names the user has across organizations
 */
export function buildRolesList(
  roles: OrganizationRole[],
  currentOrganizationId?: string
): string[] {
  if (!roles || roles.length === 0) {
    return ['member']; // Default fallback
  }

  // Get unique role names
  const roleSet = new Set<string>();

  for (const orgRole of roles) {
    // Only include roles from active organizations
    if (orgRole.organization.is_active) {
      roleSet.add(orgRole.role.unique_name);
    }
  }

  // If filtering by org, prioritize that org's role
  if (currentOrganizationId) {
    const currentOrgRole = roles.find(
      (r) => r.organization.id === currentOrganizationId && r.organization.is_active
    );
    if (currentOrgRole) {
      // Ensure current org's role is in the list
      roleSet.add(currentOrgRole.role.unique_name);
    }
  }

  return Array.from(roleSet);
}
