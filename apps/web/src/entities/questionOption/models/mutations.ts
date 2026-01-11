/**
 * Question Option Mutation Types
 *
 * Re-export mutation variables and extract result types from generated GraphQL.
 * Following graphql-code skill type safety rules.
 */
import type {
  CreateQuestionOptionMutation,
  CreateQuestionOptionMutationVariables,
  DeleteQuestionOptionMutationVariables,
  UpdateQuestionOptionMutation,
  UpdateQuestionOptionMutationVariables,
  UpsertQuestionOptionsMutation,
  UpsertQuestionOptionsMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type CreateQuestionOptionVariables = CreateQuestionOptionMutationVariables;
export type DeleteQuestionOptionVariables = DeleteQuestionOptionMutationVariables;
export type UpdateQuestionOptionVariables = UpdateQuestionOptionMutationVariables;
export type UpsertQuestionOptionsVariables = UpsertQuestionOptionsMutationVariables;

// Extract Mutation Result Types (from mutation response)
export type QuestionOptionCreateResult = NonNullable<
  CreateQuestionOptionMutation['insert_question_options_one']
>;
export type QuestionOptionUpdateResult = NonNullable<
  UpdateQuestionOptionMutation['update_question_options_by_pk']
>;
export type QuestionOptionUpsertResult =
  UpsertQuestionOptionsMutation['insert_question_options'];
