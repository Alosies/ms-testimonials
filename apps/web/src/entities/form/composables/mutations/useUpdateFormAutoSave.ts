import { computed } from 'vue';
import {
  useUpdateFormAutoSaveMutation,
  type UpdateFormAutoSaveMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Auto-save mutation for form product info.
 *
 * CRITICAL: Uses fetchPolicy: 'no-cache' to completely bypass Apollo cache.
 * This prevents the mutation response from triggering cache normalization,
 * which would otherwise overwrite local editing state.
 *
 * Returns ONLY id + updated_at (not written to cache).
 * See ADR-003 and ADR-010 for rationale.
 */
export function useUpdateFormAutoSave() {
  const { mutate, loading, error, onDone, onError } = useUpdateFormAutoSaveMutation({
    fetchPolicy: 'no-cache',
  });

  const hasError = computed(() => error.value !== null);

  const updateFormAutoSave = async (
    variables: UpdateFormAutoSaveMutationVariables
  ) => {
    const result = await mutate(variables);
    return result?.data?.update_forms_by_pk ?? null;
  };

  return {
    mutate,
    updateFormAutoSave,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
