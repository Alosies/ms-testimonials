import type {
  GetOrganizationQuery,
  GetOrganizationQueryVariables,
} from '@/shared/graphql/generated/operations';

// ========================================
// Re-export Query Variables
// ========================================
export type GetOrganizationVariables = GetOrganizationQueryVariables;

// ========================================
// Extract Data Types from Queries
// ========================================
export type Organization = NonNullable<GetOrganizationQuery['organizations_by_pk']>;
