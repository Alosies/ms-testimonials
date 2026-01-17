/**
 * Question Persistence - Unified persistence layer for form questions (ADR-014 Phase 6)
 *
 * Provides a single API for all question persistence operations with:
 * - Automatic save lock coordination
 * - Immediate vs deferred save modes
 * - Error handling
 *
 * @example
 * ```ts
 * const { createQuestion, updateQuestion } = useQuestionPersistence();
 *
 * // Immediate save (default for creates)
 * await createQuestion(input);
 *
 * // Deferred save (for text editing, auto-save handles)
 * await updateQuestion(id, changes, { mode: 'deferred' });
 * ```
 */
import { ref, readonly, type Ref } from 'vue';
import { useSaveLock } from '@/features/createForm/composables/autoSave/useSaveLock';
import { useDirtyTracker } from '@/features/createForm/composables/autoSave/useDirtyTracker';
import { useCreateFormQuestion } from './mutations/useCreateFormQuestion';
import { useUpdateFormQuestion } from './mutations/useUpdateFormQuestion';
import type { Form_Questions_Insert_Input, Form_Questions_Set_Input } from '@/shared/graphql/generated/operations';

// =============================================================================
// Types
// =============================================================================

export interface QuestionSaveStrategy {
  /** 'immediate' persists now, 'deferred' waits for auto-save */
  mode?: 'immediate' | 'deferred';
  /** Lock key for coordinating with other saves */
  lockKey?: string;
}

export interface QuestionPersistenceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QuestionPersistence {
  /** Create a new question with unified save handling */
  createQuestion: (input: Form_Questions_Insert_Input, strategy?: QuestionSaveStrategy) => Promise<QuestionPersistenceResult<Form_Questions_Insert_Input>>;
  /** Update a question with unified save handling */
  updateQuestion: (id: string, changes: Form_Questions_Set_Input, strategy?: QuestionSaveStrategy) => Promise<QuestionPersistenceResult>;
  /** Whether a persistence operation is in progress */
  isPersisting: Readonly<Ref<boolean>>;
}

// =============================================================================
// Default Strategies
// =============================================================================

const DEFAULT_CREATE_STRATEGY: QuestionSaveStrategy = {
  mode: 'immediate',
};

const DEFAULT_UPDATE_STRATEGY: QuestionSaveStrategy = {
  mode: 'deferred',
};

// =============================================================================
// Composable
// =============================================================================

export function useQuestionPersistence(): QuestionPersistence {
  const saveLock = useSaveLock();
  const dirtyTracker = useDirtyTracker();

  const { createFormQuestion } = useCreateFormQuestion();
  const { updateFormQuestion } = useUpdateFormQuestion();

  const isPersisting = ref(false);

  /**
   * Create a new question with unified save handling.
   * Creates are always immediate by default since server ID is needed.
   */
  async function createQuestion(
    input: Form_Questions_Insert_Input,
    strategy: QuestionSaveStrategy = DEFAULT_CREATE_STRATEGY,
  ): Promise<QuestionPersistenceResult<Form_Questions_Insert_Input>> {
    const { mode = 'immediate', lockKey = 'create-question' } = strategy;

    if (mode === 'deferred') {
      // Deferred creates are rare but supported
      dirtyTracker.mark.question(`pending-create-${input.id}`);
      return { success: true, data: input };
    }

    // Immediate mode - acquire lock and execute
    try {
      return await saveLock.withLock(lockKey, async () => {
        isPersisting.value = true;
        try {
          const result = await createFormQuestion({ input });
          if (!result) {
            return { success: false, error: 'Failed to create question' };
          }
          return { success: true, data: result as unknown as Form_Questions_Insert_Input };
        } finally {
          isPersisting.value = false;
        }
      });
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  /**
   * Update a question with unified save handling.
   * Text updates are deferred by default (auto-save handles).
   */
  async function updateQuestion(
    id: string,
    changes: Form_Questions_Set_Input,
    strategy: QuestionSaveStrategy = DEFAULT_UPDATE_STRATEGY,
  ): Promise<QuestionPersistenceResult> {
    const { mode = 'deferred', lockKey = `update-question-${id}` } = strategy;

    if (mode === 'deferred') {
      // Mark as dirty, auto-save will handle
      dirtyTracker.mark.question(id);
      return { success: true };
    }

    // Immediate mode
    try {
      return await saveLock.withLock(lockKey, async () => {
        isPersisting.value = true;
        try {
          const result = await updateFormQuestion({ id, input: changes });
          if (!result) {
            return { success: false, error: 'Failed to update question' };
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

  return {
    createQuestion,
    updateQuestion,
    isPersisting: readonly(isPersisting),
  };
}
