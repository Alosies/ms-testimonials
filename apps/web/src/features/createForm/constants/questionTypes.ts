/**
 * Question Type Constants
 *
 * Constants for categorizing question types by their capabilities.
 * Used by analyzeQuestionTypeChange and related functions.
 *
 * @see ADR-017: Question Type Change Workflow
 */

/**
 * Choice types that support question options.
 */
export const CHOICE_TYPES = ['choice_single', 'choice_multiple', 'choice_dropdown'] as const;

/**
 * Text types that support text validation (min/max length, pattern).
 */
export const TEXT_TYPES = ['text_short', 'text_long', 'text_email', 'text_url'] as const;

/**
 * Rating types that support rating configuration (min/max value, labels).
 */
export const RATING_TYPES = ['rating_star', 'rating_scale'] as const;

/**
 * Type for choice question type IDs.
 */
export type ChoiceType = (typeof CHOICE_TYPES)[number];

/**
 * Type for text question type IDs.
 */
export type TextType = (typeof TEXT_TYPES)[number];

/**
 * Type for rating question type IDs.
 */
export type RatingType = (typeof RATING_TYPES)[number];
