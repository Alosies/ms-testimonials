/**
 * Question Option Models
 *
 * Barrel export for question option types.
 * Types extracted from GraphQL queries/mutations per graphql-code skill rules.
 */
export type * from './mutations';

// Utility types
export type QuestionOptionId = string;

// Re-export input types for convenience (these are used directly in mutations)
export type {
  Question_Options_Insert_Input,
  Question_Options_Set_Input,
} from '@/shared/graphql/generated/types';
