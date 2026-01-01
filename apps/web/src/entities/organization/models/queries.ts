import type {
  GetOrganizationQuery,
  GetOrganizationQueryVariables,
  GetUserDefaultOrganizationQuery,
  GetUserDefaultOrganizationQueryVariables,
  OrganizationBasicFragment,
} from '@/shared/graphql/generated/operations';

// ========================================
// Re-export Query Variables
// ========================================
export type GetOrganizationVariables = GetOrganizationQueryVariables;
export type GetUserDefaultOrganizationVariables = GetUserDefaultOrganizationQueryVariables;

// ========================================
// Extract Data Types from Queries
// ========================================
export type Organization = NonNullable<GetOrganizationQuery['organizations_by_pk']>;

// User's default organization role assignment
export type UserOrganizationRole = GetUserDefaultOrganizationQuery['organization_roles'][number];

// Organization from the default org query
export type UserDefaultOrganization = NonNullable<UserOrganizationRole['organization']>;

// Role from the organization role assignment
export type OrganizationRole = UserOrganizationRole['role'];

// ========================================
// Plan and Question Types
// ========================================

// Organization's plan assignment (from OrganizationBasic fragment)
export type OrganizationPlan = OrganizationBasicFragment['plans'][number];

// Plan details with question types
export type OrganizationPlanDetails = OrganizationPlan['plan'];

// Plan-question type junction entry
export type PlanQuestionTypeEntry = OrganizationPlanDetails['question_types'][number];

// Question type allowed by the plan
export type AllowedQuestionType = PlanQuestionTypeEntry['question_type'];

// ========================================
// Role Type Guards and Constants
// ========================================
export type RoleUniqueName = 'owner' | 'org_admin' | 'member' | 'viewer';

/**
 * Check if a role is an admin-level role (owner or org_admin)
 */
export function isAdminRole(role: OrganizationRole | null): boolean {
  if (!role) return false;
  return role.unique_name === 'owner' || role.unique_name === 'org_admin';
}

/**
 * Check if a role is owner
 */
export function isOwnerRole(role: OrganizationRole | null): boolean {
  if (!role) return false;
  return role.unique_name === 'owner';
}
