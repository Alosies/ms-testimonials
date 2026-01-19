/**
 * Get Transferable Question Fields
 *
 * Pure function to calculate which fields can be transferred when
 * changing between question types. Returns a partial object containing
 * only the fields that are valid for the new question type.
 *
 * @see ADR-017: Question Type Change Workflow
 */

import type {
  QuestionTypeCapabilities,
  TransferableQuestionInput,
  TransferableQuestionFields,
} from '../models/functionTypes';

/**
 * Calculate which fields can be transferred when changing question types.
 *
 * Always transfers core fields that exist on all question types.
 * Conditionally transfers validation fields based on the new type's capabilities.
 *
 * @param currentQuestion - The current question's field values
 * @param newTypeCapabilities - The new question type's supported field flags
 * @returns Object containing only the fields valid for the new question type
 *
 * @example
 * ```typescript
 * const fields = getTransferableQuestionFields(
 *   currentQuestion,
 *   { supports_min_value: true, supports_max_value: true }
 * );
 * // Result includes rating fields but excludes text validation fields
 * ```
 */
export function getTransferableQuestionFields(
  currentQuestion: TransferableQuestionInput,
  newTypeCapabilities: QuestionTypeCapabilities
): TransferableQuestionFields {
  const result: TransferableQuestionFields = {
    step_id: currentQuestion.step_id,
    display_order: currentQuestion.display_order,
    question_text: currentQuestion.question_text,
    question_key: currentQuestion.question_key,
    is_required: currentQuestion.is_required,
    help_text: currentQuestion.help_text,
    organization_id: currentQuestion.organization_id,
  };

  if (newTypeCapabilities.supports_min_length && currentQuestion.min_length != null) {
    result.min_length = currentQuestion.min_length;
  }

  if (newTypeCapabilities.supports_max_length && currentQuestion.max_length != null) {
    result.max_length = currentQuestion.max_length;
  }

  if (newTypeCapabilities.supports_min_length || newTypeCapabilities.supports_max_length) {
    if (currentQuestion.placeholder != null) {
      result.placeholder = currentQuestion.placeholder;
    }
  }

  if (newTypeCapabilities.supports_pattern && currentQuestion.validation_pattern != null) {
    result.validation_pattern = currentQuestion.validation_pattern;
  }

  if (newTypeCapabilities.supports_min_value && currentQuestion.min_value != null) {
    result.min_value = currentQuestion.min_value;
  }

  if (newTypeCapabilities.supports_max_value && currentQuestion.max_value != null) {
    result.max_value = currentQuestion.max_value;
  }

  if (newTypeCapabilities.supports_min_value || newTypeCapabilities.supports_max_value) {
    if (currentQuestion.scale_min_label != null) {
      result.scale_min_label = currentQuestion.scale_min_label;
    }
    if (currentQuestion.scale_max_label != null) {
      result.scale_max_label = currentQuestion.scale_max_label;
    }
  }

  if (newTypeCapabilities.supports_file_types && currentQuestion.allowed_file_types != null) {
    result.allowed_file_types = currentQuestion.allowed_file_types;
  }

  if (newTypeCapabilities.supports_max_file_size && currentQuestion.max_file_size_kb != null) {
    result.max_file_size_kb = currentQuestion.max_file_size_kb;
  }

  return result;
}
