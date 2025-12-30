import type {
  GetUserQuery,
  GetUserQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetUserVariables = GetUserQueryVariables;

// Extract Data Types from Queries
export type User = NonNullable<GetUserQuery['users_by_pk']>;
