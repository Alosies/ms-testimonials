import { computed } from 'vue';
import {
  useUpdateFormAutoSaveMutation,
  type UpdateFormAutoSaveMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Auto-save mutation for form product info.
 *
 * IMPORTANT: This mutation returns only metadata fields (id, status, updated_at).
 * This prevents Apollo from overwriting product_name/product_description in cache,
 * which would cause UI flicker during auto-save.
 *
 * See ADR-003: Form Auto-Save Pattern
 */
export function useUpdateFormAutoSave() {
  const { mutate, loading, error, onDone, onError } =
    useUpdateFormAutoSaveMutation();

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
