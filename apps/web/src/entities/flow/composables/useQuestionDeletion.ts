import { computed, type ComputedRef, type Ref } from 'vue';
import { useGetFlowsByBranchQuestion } from './queries/useGetFlowsByBranchQuestion';
import type { GetFlowsByBranchQuestionQuery } from '@/shared/graphql/generated/operations';

type FlowWithForm = GetFlowsByBranchQuestionQuery['flows'][number];

export interface BlockedByFlow {
  flowId: string;
  flowName: string;
  formId: string;
  formName: string;
}

export interface UseQuestionDeletionReturn {
  /** Whether the question can be deleted (not used as branch point) */
  canDelete: ComputedRef<boolean>;
  /** Whether we're still checking deletion eligibility */
  isChecking: ComputedRef<boolean>;
  /** List of flows that block deletion (use this question for branching) */
  blockedByFlows: ComputedRef<BlockedByFlow[]>;
  /** Number of flows blocking deletion */
  blockedByCount: ComputedRef<number>;
  /** Human-readable reason why deletion is blocked */
  blockReason: ComputedRef<string | null>;
  /** Refresh the deletion check */
  refetch: () => void;
}

/**
 * Check if a question can be deleted.
 *
 * ADR-009 Phase 2: Questions used as branch points (flows.branch_question_id)
 * cannot be deleted due to FK RESTRICT constraint. This composable provides
 * a reactive way to check deletion eligibility and get information about
 * blocking flows.
 *
 * @param questionId - The question ID to check for deletion eligibility
 * @returns Deletion check result with canDelete, blockedByFlows, and helpers
 *
 * @example
 * ```ts
 * const questionId = ref('question-123');
 * const { canDelete, blockedByFlows, blockReason } = useQuestionDeletion(questionId);
 *
 * if (!canDelete.value) {
 *   console.log(blockReason.value);
 *   // "This question is used as a branch point in 2 flows"
 * }
 * ```
 */
export function useQuestionDeletion(
  questionId: Ref<string | null>
): UseQuestionDeletionReturn {
  const {
    flows,
    hasFlows,
    isLoading,
    refetch,
  } = useGetFlowsByBranchQuestion(questionId);

  // Map flows to BlockedByFlow format
  const blockedByFlows = computed<BlockedByFlow[]>(() =>
    flows.value.map((flow: FlowWithForm) => ({
      flowId: flow.id,
      flowName: flow.name,
      formId: flow.form?.id ?? '',
      formName: flow.form?.name ?? 'Unknown Form',
    }))
  );

  // Count of blocking flows
  const blockedByCount = computed(() => blockedByFlows.value.length);

  // Can delete if no flows are using this question for branching
  const canDelete = computed(() => !hasFlows.value);

  // Still checking if loading and no result yet
  const isChecking = computed(() => isLoading.value);

  // Human-readable block reason
  const blockReason = computed<string | null>(() => {
    if (canDelete.value) return null;

    const count = blockedByCount.value;
    if (count === 1) {
      const flow = blockedByFlows.value[0];
      return `This question is used as a branch point in "${flow.flowName}"`;
    }
    return `This question is used as a branch point in ${count} flows`;
  });

  return {
    canDelete,
    isChecking,
    blockedByFlows,
    blockedByCount,
    blockReason,
    refetch,
  };
}
