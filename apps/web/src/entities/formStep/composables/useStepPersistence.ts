/**
 * Step Persistence - Unified persistence layer for form steps (ADR-014 Phase 6)
 *
 * Provides a single API for all step persistence operations with:
 * - Automatic save lock coordination
 * - Immediate vs deferred save modes
 * - Optimistic updates support
 * - Error handling
 *
 * @example
 * ```ts
 * const { createStep, updateStep, deleteStep } = useStepPersistence();
 *
 * // Immediate save (default for discrete actions)
 * await createStep(input);
 *
 * // Deferred save (for text editing, auto-save handles)
 * await updateStep(id, changes, { mode: 'deferred' });
 * ```
 */
import { ref, readonly, type Ref } from 'vue';
import { useSaveLock } from '@/features/createForm/composables/autoSave/useSaveLock';
import { useDirtyTracker } from '@/features/createForm/composables/autoSave/useDirtyTracker';
import { useCreateFormSteps } from './mutations/useCreateFormSteps';
import { useUpsertFormSteps } from './mutations/useUpsertFormSteps';
import { useDeleteFormSteps } from './mutations/useDeleteFormSteps';
import type { Form_Steps_Insert_Input, Form_Steps_Set_Input } from '@/shared/graphql/generated/operations';

// =============================================================================
// Types
// =============================================================================

export interface StepSaveStrategy {
  /** 'immediate' persists now, 'deferred' waits for auto-save */
  mode?: 'immediate' | 'deferred';
  /** Update local state immediately (optimistic update) */
  optimistic?: boolean;
  /** Lock key for coordinating with other saves */
  lockKey?: string;
}

export interface PersistenceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StepPersistence {
  /** Create a new step with unified save handling */
  createStep: (input: Form_Steps_Insert_Input, strategy?: StepSaveStrategy) => Promise<PersistenceResult<Form_Steps_Insert_Input>>;
  /** Update a step with unified save handling */
  updateStep: (id: string, changes: Form_Steps_Set_Input, strategy?: StepSaveStrategy) => Promise<PersistenceResult>;
  /** Delete a step with unified save handling */
  deleteStep: (id: string, strategy?: StepSaveStrategy) => Promise<PersistenceResult>;
  /** Batch update step orders */
  updateStepOrders: (updates: Array<{ id: string; step_order: number }>, strategy?: StepSaveStrategy) => Promise<PersistenceResult>;
  /** Whether a persistence operation is in progress */
  isPersisting: Readonly<Ref<boolean>>;
}

// =============================================================================
// Default Strategy
// =============================================================================

const DEFAULT_CREATE_STRATEGY: StepSaveStrategy = {
  mode: 'immediate',
  optimistic: true,
};

const DEFAULT_UPDATE_STRATEGY: StepSaveStrategy = {
  mode: 'deferred',
  optimistic: true,
};

const DEFAULT_DELETE_STRATEGY: StepSaveStrategy = {
  mode: 'immediate',
  optimistic: true,
};

// =============================================================================
// Composable
// =============================================================================

export function useStepPersistence(): StepPersistence {
  const saveLock = useSaveLock();
  const dirtyTracker = useDirtyTracker();

  const { createFormSteps } = useCreateFormSteps();
  const { upsertFormSteps } = useUpsertFormSteps();
  const { deleteFormSteps } = useDeleteFormSteps();

  const isPersisting = ref(false);

  /**
   * Create a new step with unified save handling.
   * Creates are always immediate by default since server ID is needed.
   */
  async function createStep(
    input: Form_Steps_Insert_Input,
    strategy: StepSaveStrategy = DEFAULT_CREATE_STRATEGY,
  ): Promise<PersistenceResult<Form_Steps_Insert_Input>> {
    const { mode = 'immediate', lockKey = 'create-step' } = strategy;

    if (mode === 'deferred') {
      // Deferred creates are rare but supported
      dirtyTracker.mark.step(`pending-create-${input.id}`);
      return { success: true, data: input };
    }

    // Immediate mode - acquire lock and execute
    try {
      return await saveLock.withLock(lockKey, async () => {
        isPersisting.value = true;
        try {
          const results = await createFormSteps({ inputs: [input] });
          if (results.length === 0) {
            return { success: false, error: 'Failed to create step' };
          }
          return { success: true, data: results[0] as unknown as Form_Steps_Insert_Input };
        } finally {
          isPersisting.value = false;
        }
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Update a step with unified save handling.
   * Content updates are deferred by default (auto-save handles).
   */
  async function updateStep(
    id: string,
    changes: Form_Steps_Set_Input,
    strategy: StepSaveStrategy = DEFAULT_UPDATE_STRATEGY,
  ): Promise<PersistenceResult> {
    const { mode = 'deferred', lockKey = `update-step-${id}` } = strategy;

    if (mode === 'deferred') {
      // Mark as dirty, auto-save will handle
      dirtyTracker.mark.step(id);
      return { success: true };
    }

    // Immediate mode
    try {
      return await saveLock.withLock(lockKey, async () => {
        isPersisting.value = true;
        try {
          const results = await upsertFormSteps({
            inputs: [{ id, ...changes }],
          });
          if (results.length === 0) {
            return { success: false, error: 'Failed to update step' };
          }
          return { success: true };
        } finally {
          isPersisting.value = false;
        }
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Delete a step with unified save handling.
   * Deletes are always immediate by default.
   */
  async function deleteStep(
    id: string,
    strategy: StepSaveStrategy = DEFAULT_DELETE_STRATEGY,
  ): Promise<PersistenceResult> {
    const { mode = 'immediate', lockKey = `delete-step-${id}` } = strategy;

    if (mode === 'deferred') {
      dirtyTracker.mark.step(`pending-delete-${id}`);
      return { success: true };
    }

    try {
      return await saveLock.withLock(lockKey, async () => {
        isPersisting.value = true;
        try {
          const result = await deleteFormSteps({ ids: [id] });
          if (result.affectedRows === 0) {
            return { success: false, error: 'Step not found or already deleted' };
          }
          return { success: true };
        } finally {
          isPersisting.value = false;
        }
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Batch update step orders.
   * Reorders are always immediate to maintain consistency.
   */
  async function updateStepOrders(
    updates: Array<{ id: string; step_order: number }>,
    strategy: StepSaveStrategy = DEFAULT_CREATE_STRATEGY,
  ): Promise<PersistenceResult> {
    const { lockKey = 'batch-reorder' } = strategy;

    if (updates.length === 0) {
      return { success: true };
    }

    try {
      return await saveLock.withLock(lockKey, async () => {
        isPersisting.value = true;
        try {
          const inputs = updates.map(({ id, step_order }) => ({
            id,
            step_order,
          }));
          await upsertFormSteps({ inputs });
          return { success: true };
        } finally {
          isPersisting.value = false;
        }
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  return {
    createStep,
    updateStep,
    deleteStep,
    updateStepOrders,
    isPersisting: readonly(isPersisting),
  };
}
