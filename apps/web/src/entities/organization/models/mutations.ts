import type {
  UpdateOrganizationMutation,
  UpdateOrganizationMutationVariables,
} from '@/shared/graphql/generated/operations';

// ========================================
// Re-export Mutation Variables
// ========================================
export type UpdateOrganizationVariables = UpdateOrganizationMutationVariables;

// ========================================
// Extract Mutation Result Types
// ========================================
export type OrganizationUpdateResult = NonNullable<
  UpdateOrganizationMutation['update_organizations_by_pk']
>;
