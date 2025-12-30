import type {
  GetOrganizationQuery,
  GetOrganizationQueryVariables,
  GetUserDefaultOrganizationQuery,
  GetUserDefaultOrganizationQueryVariables,
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
export type UserDefaultOrganization = NonNullable<
  GetUserDefaultOrganizationQuery['organization_roles'][number]['organization']
>;
