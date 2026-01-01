/**
 * Form Input Components - Type Definitions
 *
 * Types extracted from GraphQL generated types where possible.
 * This ensures types stay in sync with the database schema.
 */

import type {
  Form_Questions,
  Question_Options,
} from '@/shared/graphql/generated/types';

// Re-export QuestionTypeId from the API models (source of truth)
export type { QuestionTypeId } from '@/shared/api/ai/models/suggestQuestions';

/**
 * Question option type - extracted from generated Question_Options
 */
export type QuestionOptionItem = Pick<
  Question_Options,
  'option_value' | 'option_label' | 'display_order'
>;

/**
 * Base fields extracted from Form_Questions
 */
type FormQuestionFields = Pick<
  Form_Questions,
  'placeholder' | 'is_required' | 'min_value' | 'max_value' | 'question_type_id'
>;

/**
 * Props interface for all question input components.
 * This is the strict contract that all input components must implement.
 *
 * Extends generated types with fields not yet in codegen.
 */
export interface QuestionInputProps extends Partial<FormQuestionFields> {
  /** Unique identifier for the question (used for form field IDs) */
  questionId: string;

  /** Whether the input is disabled (preview mode) */
  disabled?: boolean;

  /** Options for choice-based inputs (choice_single, choice_multiple) */
  options?: QuestionOptionItem[] | null;

  /** Label for minimum value on linear scale (e.g., "Not likely") */
  scaleMinLabel?: string | null;

  /** Label for maximum value on linear scale (e.g., "Very likely") */
  scaleMaxLabel?: string | null;
}

/**
 * Answer value types - union of all possible answer types.
 * Different question types produce different value types:
 * - string: text_short, text_long, text_email, choice_single
 * - number: rating_star, rating_scale
 * - boolean: input_checkbox, input_switch
 * - string[]: choice_multiple
 */
export type QuestionAnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

/**
 * Type-safe answer map keyed by question type.
 * Useful for type narrowing based on question type.
 */
export interface QuestionAnswerMap {
  text_short: string;
  text_long: string;
  text_email: string;
  rating_star: number;
  rating_scale: number;
  choice_single: string;
  choice_multiple: string[];
  input_checkbox: boolean;
  input_switch: boolean;
}

/**
 * Props for the QuestionField wrapper component.
 * Includes both input props and display props (label, help text).
 */
export interface QuestionFieldProps extends QuestionInputProps {
  /** The question text displayed as label */
  questionText: string;

  /** Help text shown below the input */
  helpText?: string | null;
}
