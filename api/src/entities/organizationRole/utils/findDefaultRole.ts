import type { OrganizationRole, UserRoleInfo } from '../models';
import { defaultRole } from '@/shared/constants';

/**
 * Find the default role info from user's roles
 * Returns the default organization and role, or first available if no default set
 */
export function findDefaultRole(roles: OrganizationRole[]): UserRoleInfo {
  if (!roles || roles.length === 0) {
    return {
      currentOrganizationId: null,
      currentOrganizationSlug: null,
      userRole: defaultRole,
      allRoles: [],
    };
  }

  // Find default org, or use first one
  const defaultOrgRole = roles.find((r) => r.is_default_org) || roles[0];

  return {
    currentOrganizationId: defaultOrgRole.organization.id,
    currentOrganizationSlug: defaultOrgRole.organization.slug,
    userRole: defaultOrgRole.role.unique_name,
    allRoles: roles,
  };
}
