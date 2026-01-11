/**
 * Flow Settings - Immediate save for flow changes
 *
 * Wraps existing flow mutations with save lock for:
 * - Update condition/settings
 * - Clear branching
 */
import { useUpdateFlow, useClearFlowBranchColumns } from '@/entities/flow/composables';
import { useSaveLock } from './autoSave';
import type { Flows_Set_Input } from '@/shared/graphql/generated/types';

export function useFlowSettings() {
  const { updateFlow } = useUpdateFlow();
  const { clearFlowBranchColumns } = useClearFlowBranchColumns();
  const { withLock } = useSaveLock();

  /**
   * Update flow properties (condition, etc.)
   */
  const updateFlowSettings = async (
    flowId: string,
    changes: Flows_Set_Input
  ) => {
    return withLock('update-flow', async () => {
      await updateFlow({ flowId, _set: changes });
    });
  };

  /**
   * Clear all branching from all flows in a form.
   */
  const clearBranching = async (formId: string) => {
    return withLock('clear-branching', async () => {
      await clearFlowBranchColumns(formId);
    });
  };

  return {
    updateFlowSettings,
    clearBranching,
  };
}
