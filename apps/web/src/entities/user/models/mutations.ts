import type {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type UpdateUserVariables = UpdateUserMutationVariables;

// Extract Mutation Result Types
export type UserUpdateResult = NonNullable<UpdateUserMutation['update_users_by_pk']>;
