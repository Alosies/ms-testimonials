/**
 * Analyze Question Type Change
 *
 * Pure function to determine what data will be lost when changing
 * between question types. Used to show appropriate warnings to users.
 *
 * @see ADR-017: Question Type Change Workflow
 */

import type { TypeChangeAnalysis, AnalyzableQuestion } from '../models/functionTypes';
import { CHOICE_TYPES, TEXT_TYPES, RATING_TYPES } from '../constants/questionTypes';

/**
 * Check if a question type is a choice type that supports options.
 */
function isChoiceType(type: string): boolean {
  return (CHOICE_TYPES as readonly string[]).includes(type);
}

/**
 * Check if a question type is a text type with text validation.
 */
function isTextType(type: string): boolean {
  return (TEXT_TYPES as readonly string[]).includes(type);
}

/**
 * Check if a question type is a rating type with rating configuration.
 */
function isRatingType(type: string): boolean {
  return (RATING_TYPES as readonly string[]).includes(type);
}

/**
 * Analyze what data will be lost when changing from one question type to another.
 *
 * @param currentType - The current question_type_id (e.g., 'choice_single')
 * @param newType - The target question_type_id (e.g., 'rating_star')
 * @param currentQuestion - The question data with optional options array
 * @returns Analysis of what data will be lost and whether warning is needed
 *
 * @example
 * ```typescript
 * const analysis = analyzeQuestionTypeChange(
 *   'choice_single',
 *   'rating_star',
 *   { options: [{ value: 'a' }, { value: 'b' }] }
 * );
 * // Result: { willLoseOptions: true, optionCount: 2, requiresWarning: true, ... }
 * ```
 */
export function analyzeQuestionTypeChange(
  currentType: string,
  newType: string,
  currentQuestion: AnalyzableQuestion
): TypeChangeAnalysis {
  const isCurrentChoice = isChoiceType(currentType);
  const isNewChoice = isChoiceType(newType);

  const willLoseOptions = isCurrentChoice && !isNewChoice;
  const optionCount = currentQuestion.options?.length ?? 0;

  const willLoseTextValidation = isTextType(currentType) && !isTextType(newType);
  const willLoseRatingConfig = isRatingType(currentType) && !isRatingType(newType);

  return {
    willLoseOptions,
    optionCount: willLoseOptions ? optionCount : 0,
    willLoseTextValidation,
    willLoseRatingConfig,
    requiresWarning: willLoseOptions && optionCount > 0,
  };
}
