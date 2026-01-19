/**
 * Question Type Change - Orchestrates type change workflow
 *
 * Handles the complete workflow when a user changes a question's type:
 * 1. Create a new question with the new type (transferring compatible fields)
 * 2. Delete the old question (CASCADE handles options)
 *
 * Uses useSaveLock for save coordination and useSaveIndicator for UI feedback.
 * Uses getTransferableQuestionFields to calculate which fields transfer to the new type.
 *
 * The step reference is maintained because questions have step_id (not vice versa),
 * so creating the new question with the same step_id preserves the relationship.
 *
 * @see ADR-017: Question Type Change Workflow
 */
import { useCreateFormQuestion, useDeleteFormQuestion, useDeleteQuestionResponses } from '@/entities/formQuestion';
import type { Form_Questions_Insert_Input } from '@/shared/graphql/generated/operations';
import { useSaveLock, useAutoSaveController } from '../autoSave';
import {
  getTransferableQuestionFields,
  type QuestionTypeCapabilities,
  type TransferableQuestionInput,
} from '../../functions';

/**
 * Input for replacing a question with a new type.
 * Contains the current question data and target type information.
 */
export interface ReplaceQuestionParams {
  /** Current question data with all fields */
  currentQuestion: TransferableQuestionInput & {
    id: string;
    question_type_id: string;
  };
  /** New question type ID (e.g., 'rating_star', 'text_short') */
  newTypeId: string;
  /** Capabilities of the new question type (from question_types table) */
  newTypeCapabilities: QuestionTypeCapabilities;
}

/**
 * Result from replacing a question with a new type.
 */
export interface ReplaceQuestionResult {
  /** ID of the newly created question */
  newQuestionId: string;
  /** ID of the deleted old question */
  oldQuestionId: string;
}

export function useQuestionTypeChange() {
  const { createFormQuestion } = useCreateFormQuestion();
  const { deleteFormQuestion } = useDeleteFormQuestion();
  const { deleteQuestionResponses } = useDeleteQuestionResponses();
  const { withLock } = useSaveLock();
  const { withSaveIndicator } = useAutoSaveController();

  /**
   * Replace a question with a new question of a different type.
   *
   * Workflow:
   * 1. Calculate transferable fields based on new type capabilities
   * 2. Create new question with new type and transferred fields
   * 3. Delete old question (CASCADE handles options automatically)
   *
   * @param params - Contains current question, new type ID, and new type capabilities
   * @returns The new question ID and old question ID
   * @throws If creation or deletion fails
   *
   * @example
   * ```typescript
   * const { replaceQuestionWithNewType } = useQuestionTypeChange();
   *
   * const result = await replaceQuestionWithNewType({
   *   currentQuestion: {
   *     id: 'abc123',
   *     step_id: 'step456',
   *     question_type_id: 'choice_single',
   *     question_text: 'How satisfied are you?',
   *     question_key: 'satisfaction',
   *     display_order: 1,
   *     is_required: true,
   *     organization_id: 'org789',
   *     // ... other fields
   *   },
   *   newTypeId: 'rating_star',
   *   newTypeCapabilities: {
   *     supports_min_value: true,
   *     supports_max_value: true,
   *   },
   * });
   * // result: { newQuestionId: 'xyz789', oldQuestionId: 'abc123' }
   * ```
   */
  const replaceQuestionWithNewType = async (
    params: ReplaceQuestionParams
  ): Promise<ReplaceQuestionResult> => {
    const { currentQuestion, newTypeId, newTypeCapabilities } = params;

    return withSaveIndicator(() =>
      withLock('question-type-change', async () => {
        // Step 1: Calculate which fields can be transferred to the new type
        const transferableFields = getTransferableQuestionFields(
          currentQuestion,
          newTypeCapabilities
        );

        // Step 2: Create new question with new type and transferred fields
        const newQuestionInput: Form_Questions_Insert_Input = {
          ...transferableFields,
          question_type_id: newTypeId,
          is_active: true,
        };

        const newQuestion = await createFormQuestion({ input: newQuestionInput });

        if (!newQuestion?.id) {
          throw new Error('Failed to create new question');
        }

        // Step 3: Delete old question (CASCADE handles options)
        await deleteFormQuestion({ id: currentQuestion.id });

        return {
          newQuestionId: newQuestion.id,
          oldQuestionId: currentQuestion.id,
        };
      })
    );
  };

  /**
   * Delete all responses for a question.
   *
   * Should be called before replaceQuestionWithNewType when the question
   * has existing responses that need to be cleared.
   *
   * @param questionId - ID of the question to delete responses for
   * @returns Number of deleted responses
   *
   * @example
   * ```typescript
   * const { deleteQuestionResponses, replaceQuestionWithNewType } = useQuestionTypeChange();
   *
   * // Delete responses first if any exist
   * const deletedCount = await deleteResponses('question123');
   * console.log(`Deleted ${deletedCount} responses`);
   *
   * // Then replace the question
   * await replaceQuestionWithNewType({ ... });
   * ```
   */
  const deleteResponses = async (questionId: string): Promise<number> => {
    return withSaveIndicator(() =>
      withLock('delete-responses', async () => {
        return deleteQuestionResponses({ questionId });
      })
    );
  };

  return {
    replaceQuestionWithNewType,
    deleteQuestionResponses: deleteResponses,
  };
}
