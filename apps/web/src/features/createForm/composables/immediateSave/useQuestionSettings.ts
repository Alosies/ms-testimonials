/**
 * Question Settings - Immediate save for discrete question changes
 *
 * Wraps useUpdateFormQuestion with save lock for:
 * - Toggle required
 * - Change question type
 * - Set validation constraints
 *
 * Uses withSaveIndicator to show the Saving → Saved chip transition.
 */
import { useUpdateFormQuestion } from '@/entities/formQuestion/composables';
import { useSaveLock, useAutoSaveController } from '../autoSave';

export function useQuestionSettings() {
  const { updateFormQuestion } = useUpdateFormQuestion();
  const { withLock } = useSaveLock();
  const { withSaveIndicator } = useAutoSaveController();

  const setRequired = async (questionId: string, isRequired: boolean) => {
    return withSaveIndicator(() =>
      withLock('question-required', async () => {
        await updateFormQuestion({
          id: questionId,
          input: { is_required: isRequired },
        });
      })
    );
  };

  const setQuestionType = async (questionId: string, questionTypeId: string) => {
    return withSaveIndicator(() =>
      withLock('question-type', async () => {
        await updateFormQuestion({
          id: questionId,
          input: { question_type_id: questionTypeId },
        });
      })
    );
  };

  const setValidation = async (
    questionId: string,
    validation: {
      min_value?: number | null;
      max_value?: number | null;
      min_length?: number | null;
      max_length?: number | null;
      scale_min_label?: string | null;
      scale_max_label?: string | null;
      validation_pattern?: string | null;
    }
  ) => {
    return withSaveIndicator(() =>
      withLock('question-validation', async () => {
        await updateFormQuestion({
          id: questionId,
          input: validation,
        });
      })
    );
  };

  return {
    setRequired,
    setQuestionType,
    setValidation,
  };
}
