import { computed } from 'vue';
import {
  useUpdateFormQuestionAutoSaveMutation,
  type UpdateFormQuestionAutoSaveMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Auto-save mutation for form questions with minimal response.
 *
 * CRITICAL: Uses fetchPolicy: 'no-cache' to completely bypass Apollo cache.
 * This prevents the mutation response from triggering cache normalization,
 * which would otherwise overwrite local editing state.
 *
 * Returns ONLY id + updated_at (not written to cache).
 * See ADR-003 and ADR-010 for rationale.
 *
 * Use this for auto-saving text fields (question_text, placeholder, help_text, scale labels).
 * DO NOT use updateFormQuestion for auto-save.
 */
export function useUpdateFormQuestionAutoSave() {
  const { mutate, loading, error, onDone, onError } = useUpdateFormQuestionAutoSaveMutation({
    fetchPolicy: 'no-cache',
  });

  const hasError = computed(() => error.value !== null);

  const updateFormQuestionAutoSave = async (
    variables: UpdateFormQuestionAutoSaveMutationVariables
  ) => {
    const result = await mutate(variables);
    return result?.data?.update_form_questions_by_pk ?? null;
  };

  return {
    mutate,
    updateFormQuestionAutoSave,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
