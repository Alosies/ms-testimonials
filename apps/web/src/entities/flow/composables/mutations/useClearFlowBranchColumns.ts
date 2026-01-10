import { computed, type ComputedRef, type Ref } from 'vue';
import type { ApolloError } from '@apollo/client';
import {
  useClearFlowBranchColumnsMutation,
  type ClearFlowBranchColumnsMutationVariables,
  type ClearFlowBranchColumnsMutation,
} from '@/shared/graphql/generated/operations';

type ClearResult = ClearFlowBranchColumnsMutation['update_flows'];

export interface UseClearFlowBranchColumnsReturn {
  mutate: ReturnType<typeof useClearFlowBranchColumnsMutation>['mutate'];
  clearFlowBranchColumns: (formId: string) => Promise<ClearResult | null>;
  loading: Ref<boolean>;
  error: Ref<ApolloError | null>;
  hasError: ComputedRef<boolean>;
}

/**
 * Clear branch columns from all flows in a form.
 *
 * ADR-009 Phase 2: Used when disabling branching or before deleting
 * a step that is referenced as a branch point. Clears branch_question_id,
 * branch_field, branch_operator, and branch_value from all flows.
 *
 * @example
 * ```ts
 * const { clearFlowBranchColumns } = useClearFlowBranchColumns();
 * await clearFlowBranchColumns('form-123');
 * ```
 */
export function useClearFlowBranchColumns(): UseClearFlowBranchColumnsReturn {
  const { mutate, loading, error } = useClearFlowBranchColumnsMutation();

  const hasError = computed(() => error.value !== null);

  const clearFlowBranchColumns = async (formId: string): Promise<ClearResult | null> => {
    const variables: ClearFlowBranchColumnsMutationVariables = { formId };
    const result = await mutate(variables);
    return result?.data?.update_flows ?? null;
  };

  return {
    mutate,
    clearFlowBranchColumns,
    loading,
    error,
    hasError,
  };
}
