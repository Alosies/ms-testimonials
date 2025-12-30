import type {
  FetchUserRolesQuery,
  AssignRoleMutationVariables,
} from '@/graphql/generated/operations';

// OrganizationRole type extracted from FetchUserRoles query (includes nested organization and role)
export type OrganizationRole = FetchUserRolesQuery['organization_roles'][0];

// Nested Role type from OrganizationRole
export type RoleWithPermissions = OrganizationRole['role'];

// Input type extracted from AssignRole mutation variables
export type AssignRoleInput = Omit<AssignRoleMutationVariables, '__typename'>;

// Derived type for role resolution results
export interface UserRoleInfo {
  currentOrganizationId: string | null;
  currentOrganizationSlug: string | null;
  userRole: string;
  allRoles: OrganizationRole[];
}
