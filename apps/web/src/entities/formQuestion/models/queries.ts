import type {
  GetFormQuestionsQuery,
  GetFormQuestionsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetFormQuestionsVariables = GetFormQuestionsQueryVariables;

// Extract Query Result Types
export type FormQuestionItem = GetFormQuestionsQuery['form_questions'][number];
export type FormQuestionList = GetFormQuestionsQuery['form_questions'];
