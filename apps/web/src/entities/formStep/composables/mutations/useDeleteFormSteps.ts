import { computed } from 'vue';
import {
  useDeleteFormStepsMutation,
  type DeleteFormStepsMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Delete form steps by IDs.
 * Used when disabling branching to remove improvement flow steps.
 */
export function useDeleteFormSteps() {
  const { mutate, loading, error, onDone, onError } = useDeleteFormStepsMutation();

  const hasError = computed(() => error.value !== null);

  const deleteFormSteps = async (variables: DeleteFormStepsMutationVariables) => {
    const result = await mutate(variables);
    return {
      affectedRows: result?.data?.delete_form_steps?.affected_rows ?? 0,
      deletedIds: result?.data?.delete_form_steps?.returning.map(s => s.id) ?? [],
    };
  };

  return {
    mutate,
    deleteFormSteps,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
