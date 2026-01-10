import { computed, type ComputedRef, type Ref } from 'vue';
import type { ApolloError } from '@apollo/client';
import {
  useUpdateFlowMutation,
  type UpdateFlowMutationVariables,
  type UpdateFlowMutation,
} from '@/shared/graphql/generated/operations';

type UpdateFlowResult = UpdateFlowMutation['update_flows_by_pk'];

export interface UseUpdateFlowReturn {
  mutate: ReturnType<typeof useUpdateFlowMutation>['mutate'];
  updateFlow: (variables: UpdateFlowMutationVariables) => Promise<UpdateFlowResult | null>;
  loading: Ref<boolean>;
  error: Ref<ApolloError | null>;
  hasError: ComputedRef<boolean>;
  onDone: ReturnType<typeof useUpdateFlowMutation>['onDone'];
  onError: ReturnType<typeof useUpdateFlowMutation>['onError'];
}

/**
 * Updates a single flow by primary key.
 * Returns the updated flow with all FlowBasic fields.
 */
export function useUpdateFlow(): UseUpdateFlowReturn {
  const { mutate, loading, error, onDone, onError } = useUpdateFlowMutation();

  const hasError = computed(() => error.value !== null);

  const updateFlow = async (variables: UpdateFlowMutationVariables): Promise<UpdateFlowResult | null> => {
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
