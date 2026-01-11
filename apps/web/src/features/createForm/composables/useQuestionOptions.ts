/**
 * Question Options - Immediate save for option CRUD
 *
 * Handles add/delete/reorder of question options with immediate persistence.
 * Uses the new questionOption entity composables.
 */
import {
  useCreateQuestionOption,
  useDeleteQuestionOption,
  useUpsertQuestionOptions,
} from '@/entities/questionOption';
import { useSaveLock } from './autoSave';

export function useQuestionOptions() {
  const { createQuestionOption } = useCreateQuestionOption();
  const { deleteQuestionOption } = useDeleteQuestionOption();
  const { upsertQuestionOptions } = useUpsertQuestionOptions();
  const { withLock } = useSaveLock();

  /**
   * Add a new option to a question.
   * Calculates display_order based on existing options.
   */
  const addOption = async (params: {
    questionId: string;
    organizationId: string;
    userId: string;
    label: string;
    value: string;
    displayOrder: number;
  }) => {
    return withLock('add-option', async () => {
      const result = await createQuestionOption({
        question_id: params.questionId,
        organization_id: params.organizationId,
        created_by: params.userId,
        option_label: params.label,
        option_value: params.value,
        display_order: params.displayOrder,
        is_default: false,
        is_active: true,
      });
      return result;
    });
  };

  /**
   * Delete an option by ID.
   */
  const removeOption = async (optionId: string) => {
    return withLock('remove-option', async () => {
      await deleteQuestionOption({ id: optionId });
    });
  };

  /**
   * Reorder options by upserting with new display_order values.
   */
  const reorderOptions = async (
    options: Array<{ id: string; display_order: number }>
  ) => {
    return withLock('reorder-options', async () => {
      await upsertQuestionOptions({
        inputs: options.map((o) => ({
          id: o.id,
          display_order: o.display_order,
        })),
      });
    });
  };

  /**
   * Set an option as default (and unset others).
   */
  const setDefaultOption = async (
    optionId: string,
    allOptionIds: string[]
  ) => {
    return withLock('set-default-option', async () => {
      await upsertQuestionOptions({
        inputs: allOptionIds.map((id) => ({
          id,
          is_default: id === optionId,
        })),
      });
    });
  };

  return {
    addOption,
    removeOption,
    reorderOptions,
    setDefaultOption,
  };
}
