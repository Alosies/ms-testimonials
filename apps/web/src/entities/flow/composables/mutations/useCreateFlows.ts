import { computed } from 'vue';
import {
  useCreateFlowsMutation,
  type CreateFlowsMutationVariables,
} from '@/shared/graphql/generated/operations';

export function useCreateFlows() {
  const { mutate, loading, error, onDone, onError } = useCreateFlowsMutation();

  const hasError = computed(() => error.value !== null);

  const createFlows = async (variables: CreateFlowsMutationVariables) => {
    const result = await mutate(variables);
    return result?.data?.insert_flows?.returning ?? [];
  };

  return {
    mutate,
    createFlows,
    loading,
    error,
    hasError,
    onDone,
    onError,
  };
}
