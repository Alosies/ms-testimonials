import { computed } from 'vue';
import {
  useDeleteFlowMutation,
  type DeleteFlowMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Deletes a single flow by primary key.
 * Returns the deleted flow's ID for confirmation.
 */
export function useDeleteFlow() {
  const { mutate, loading, error, onDone, onError } = useDeleteFlowMutation();

  const hasError = computed(() => error.value !== null);

  const deleteFlow = async (variables: DeleteFlowMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.delete_flows_by_pk?.id ?? null;
  };

  return {
    mutate,
    deleteFlow,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
