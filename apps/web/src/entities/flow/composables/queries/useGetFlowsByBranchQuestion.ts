import { computed, type ComputedRef, type Ref } from 'vue';
import type { ApolloError } from '@apollo/client';
import {
  useGetFlowsByBranchQuestionQuery,
  type GetFlowsByBranchQuestionQueryVariables,
  type GetFlowsByBranchQuestionQuery,
} from '@/shared/graphql/generated/operations';

type FlowWithForm = GetFlowsByBranchQuestionQuery['flows'][number];

export interface UseGetFlowsByBranchQuestionReturn {
  flows: ComputedRef<FlowWithForm[]>;
  loading: Ref<boolean>;
  isLoading: ComputedRef<boolean>;
  hasFlows: ComputedRef<boolean>;
  error: Ref<ApolloError | null>;
  refetch: ReturnType<typeof useGetFlowsByBranchQuestionQuery>['refetch'];
  result: Ref<GetFlowsByBranchQuestionQuery | undefined>;
}

/**
 * Fetches flows that use a specific question for branching.
 * Used for deletion protection - prevents deleting a question
 * that is referenced as a branch point by one or more flows.
 */
export function useGetFlowsByBranchQuestion(
  branchQuestionId: Ref<string | null>
): UseGetFlowsByBranchQuestionReturn {
  const variables = computed<GetFlowsByBranchQuestionQueryVariables>(() => ({
    branchQuestionId: branchQuestionId.value ?? '',
  }));

  const enabled = computed(() => !!branchQuestionId.value);

  const { result, loading, error, refetch } = useGetFlowsByBranchQuestionQuery(
    variables,
    { enabled }
  );

  const flows = computed(() => result.value?.flows ?? []);
  const isLoading = computed(() => loading.value && !result.value);
  const hasFlows = computed(() => flows.value.length > 0);

  return {
    flows,
    loading,
    isLoading,
    hasFlows,
    error,
    refetch,
    result,
  };
}
