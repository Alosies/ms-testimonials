import type {
  CreateFormQuestionMutation,
  CreateFormQuestionMutationVariables,
  CreateFormQuestionsMutation,
  CreateFormQuestionsMutationVariables,
  UpdateFormQuestionMutation,
  UpdateFormQuestionMutationVariables,
  DeleteFormQuestionMutation,
  DeleteFormQuestionMutationVariables,
  ReorderFormQuestionsMutation,
  ReorderFormQuestionsMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateFormQuestionVariables = CreateFormQuestionMutationVariables;
export type CreateFormQuestionsVariables = CreateFormQuestionsMutationVariables;
export type UpdateFormQuestionVariables = UpdateFormQuestionMutationVariables;
export type DeleteFormQuestionVariables = DeleteFormQuestionMutationVariables;
export type ReorderFormQuestionsVariables = ReorderFormQuestionsMutationVariables;

// Extract Mutation Result Types
export type FormQuestionCreateResult = NonNullable<CreateFormQuestionMutation['insert_form_questions_one']>;
export type FormQuestionsCreateResult = NonNullable<CreateFormQuestionsMutation['insert_form_questions']>['returning'];
export type FormQuestionUpdateResult = NonNullable<UpdateFormQuestionMutation['update_form_questions_by_pk']>;
export type FormQuestionDeleteResult = NonNullable<DeleteFormQuestionMutation['update_form_questions_by_pk']>;
export type FormQuestionsReorderResult = ReorderFormQuestionsMutation['update_form_questions_many'];
