/**
 * Question Settings - Immediate save for discrete question changes
 *
 * Wraps useUpdateFormQuestionAutoSave with save lock for:
 * - Toggle required
 * - Change question type
 * - Set validation constraints
 *
 * Uses withSaveIndicator to show the Saving → Saved chip transition.
 *
 * CRITICAL: Uses AutoSave mutation (minimal response: id + updated_at only)
 * to prevent Apollo cache from overwriting unsaved local text field edits.
 * The full mutation returns all fields which would destroy pending changes.
 *
 * @see ADR-003: Auto-Save Dirty Tracking
 * @see ADR-010: Minimal Response Pattern
 */
import { useUpdateFormQuestionAutoSave } from '@/entities/formQuestion/composables';
import { useSaveLock, useAutoSaveController } from '../autoSave';

export function useQuestionSettings() {
  const { updateFormQuestionAutoSave } = useUpdateFormQuestionAutoSave();
  const { withLock } = useSaveLock();
  const { withSaveIndicator } = useAutoSaveController();

  const setRequired = async (questionId: string, isRequired: boolean) => {
    return withSaveIndicator(() =>
      withLock('question-required', async () => {
        await updateFormQuestionAutoSave({
          id: questionId,
          changes: { is_required: isRequired },
        });
      })
    );
  };

  const setQuestionType = async (questionId: string, questionTypeId: string) => {
    return withSaveIndicator(() =>
      withLock('question-type', async () => {
        await updateFormQuestionAutoSave({
          id: questionId,
          changes: { question_type_id: questionTypeId },
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
        await updateFormQuestionAutoSave({
          id: questionId,
          changes: validation,
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
