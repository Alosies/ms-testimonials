/**
 * E2E Form Constants
 */

/**
 * Question type unique names (stable across environments)
 * Use getQuestionTypeId() to get the actual database ID at runtime
 */
export const QUESTION_TYPE_NAMES = {
  TEXT_SHORT: 'text_short',
  TEXT_LONG: 'text_long',
  RATING_STAR: 'rating_star',
  CHOICE_SINGLE: 'choice_single',
} as const;

/**
 * @deprecated Use QUESTION_TYPE_NAMES with getQuestionTypeId() instead
 * These IDs are environment-specific and will fail in different databases
 */
export const QUESTION_TYPE_IDS = {
  TEXT_SHORT: '4bi1NP57H4eV',
  TEXT_LONG: 'kZhx89QTM2ts',
  RATING_STAR: 'wCbQ9s81jyS2',
} as const;
