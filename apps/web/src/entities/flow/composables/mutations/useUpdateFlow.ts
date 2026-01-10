import { computed } from 'vue';
import {
  useUpdateFlowMutation,
  type UpdateFlowMutationVariables,
} from '@/shared/graphql/generated/operations';

/**
 * Updates a single flow by primary key.
 * Returns the updated flow with all FlowBasic fields.
 */
export function useUpdateFlow() {
  const { mutate, loading, error, onDone, onError } = useUpdateFlowMutation();

  const hasError = computed(() => error.value !== null);

  const updateFlow = async (variables: UpdateFlowMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.update_flows_by_pk ?? null;
  };

  return {
    mutate,
    updateFlow,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
