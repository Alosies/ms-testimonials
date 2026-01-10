import { computed, type ComputedRef, type Ref } from 'vue';
import type { ApolloError } from '@apollo/client';
import {
  useDeleteFlowMutation,
  type DeleteFlowMutationVariables,
} from '@/shared/graphql/generated/operations';

export interface UseDeleteFlowReturn {
  mutate: ReturnType<typeof useDeleteFlowMutation>['mutate'];
  deleteFlow: (variables: DeleteFlowMutationVariables) => Promise<string | null>;
  loading: Ref<boolean>;
  error: Ref<ApolloError | null>;
  hasError: ComputedRef<boolean>;
  onDone: ReturnType<typeof useDeleteFlowMutation>['onDone'];
  onError: ReturnType<typeof useDeleteFlowMutation>['onError'];
}

/**
 * Deletes a single flow by primary key.
 * Returns the deleted flow's ID for confirmation.
 */
export function useDeleteFlow(): UseDeleteFlowReturn {
  const { mutate, loading, error, onDone, onError } = useDeleteFlowMutation();

  const hasError = computed(() => error.value !== null);

  const deleteFlow = async (variables: DeleteFlowMutationVariables): Promise<string | null> => {
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
