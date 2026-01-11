import { computed } from 'vue';
import {
  useUpdateFormStepAutoSaveMutation,
  type UpdateFormStepAutoSaveMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Auto-save mutation for form steps with minimal response.
 *
 * CRITICAL: Uses fetchPolicy: 'no-cache' to completely bypass Apollo cache.
 * This prevents the mutation response from triggering cache normalization,
 * which would otherwise overwrite local editing state.
 *
 * Returns ONLY id + updated_at (not written to cache).
 * See ADR-003 and ADR-010 for rationale.
 *
 * Use this for auto-saving text content (tips, content fields).
 * DO NOT use upsertFormSteps or updateFormStep for auto-save.
 */
export function useUpdateFormStepAutoSave() {
  const { mutate, loading, error, onDone, onError } = useUpdateFormStepAutoSaveMutation({
    fetchPolicy: 'no-cache',
  });

  const hasError = computed(() => error.value !== null);

  const updateFormStepAutoSave = async (variables: UpdateFormStepAutoSaveMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_form_steps_by_pk ?? null;
  };

  return {
    mutate,
    updateFormStepAutoSave,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
