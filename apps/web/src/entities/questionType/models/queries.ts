import type {
  GetQuestionTypesQuery,
} from '@/shared/graphql/generated/operations';

// Extract Data Types from Queries
export type QuestionTypesData = GetQuestionTypesQuery['question_types'];
export type QuestionType = GetQuestionTypesQuery['question_types'][number];
