/**
 * Query-related types for Flow entity.
 *
 * Types are extracted from GraphQL query results following the pattern:
 * Query['field'][number] for array items.
 */
import type { ComputedRef } from 'vue';
import type { GetFlowsByBranchQuestionQuery } from '@/shared/graphql/generated/operations';

// =============================================================================
// Query Result Types
// =============================================================================

/**
 * Flow with form relationship, extracted from GetFlowsByBranchQuestion query.
 * Used for deletion protection checks.
 */
export type FlowWithForm = GetFlowsByBranchQuestionQuery['flows'][number];

// =============================================================================
// Question Deletion Types
// =============================================================================

/**
 * Information about a flow that blocks question deletion.
 */
export interface BlockedByFlow {
  flowId: string;
  flowName: string;
  formId: string;
  formName: string;
}

/**
 * Return type for useQuestionDeletion composable.
 */
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
