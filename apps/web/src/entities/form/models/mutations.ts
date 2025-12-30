import type {
  CreateFormMutation,
  CreateFormMutationVariables,
  UpdateFormMutation,
  UpdateFormMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateFormVariables = CreateFormMutationVariables;
export type UpdateFormVariables = UpdateFormMutationVariables;

// Extract Mutation Result Types
export type FormCreateResult = NonNullable<CreateFormMutation['insert_forms_one']>;
export type FormUpdateResult = NonNullable<UpdateFormMutation['update_forms_by_pk']>;
