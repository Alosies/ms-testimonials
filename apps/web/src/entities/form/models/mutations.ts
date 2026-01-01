import type {
  CreateFormMutation,
  CreateFormMutationVariables,
  UpdateFormMutation,
  UpdateFormMutationVariables,
  PublishFormMutation,
  PublishFormMutationVariables,
  UpdateFormAutoSaveMutation,
  UpdateFormAutoSaveMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateFormVariables = CreateFormMutationVariables;
export type UpdateFormVariables = UpdateFormMutationVariables;
export type PublishFormVariables = PublishFormMutationVariables;
export type UpdateFormAutoSaveVariables = UpdateFormAutoSaveMutationVariables;

// Extract Mutation Result Types
export type FormCreateResult = NonNullable<CreateFormMutation['insert_forms_one']>;
export type FormUpdateResult = NonNullable<UpdateFormMutation['update_forms_by_pk']>;
export type FormPublishResult = NonNullable<PublishFormMutation['update_forms_by_pk']>;
export type FormAutoSaveResult = NonNullable<UpdateFormAutoSaveMutation['update_forms_by_pk']>;
