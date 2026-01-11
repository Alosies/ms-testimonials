/**
 * Auto-Save Controller
 *
 * Central orchestrator for the auto-save system. Coordinates:
 * - Dirty state tracking via useDirtyTracker
 * - Surgical watchers for text field changes
 * - Single debounced save timer (500ms)
 * - Parallel handler execution for all dirty entities
 * - Error recovery with dirty state restoration
 *
 * Uses createSharedComposable for singleton pattern so all components
 * share the same auto-save state and timers.
 *
 * IMPORTANT: GraphQL composables are called during setup (not in async callbacks)
 * to satisfy Apollo's requirement that composables be called during Vue component setup.
 */

import { ref, readonly, watch, toRefs } from 'vue';
import { createSharedComposable, useDebounceFn } from '@vueuse/core';
import { useDirtyTracker } from './useDirtyTracker';
import { useTimelineEditor } from '../timeline/useTimelineEditor';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useUpdateFormAutoSave } from '@/entities/form';
import { useUpdateFormQuestion } from '@/entities/formQuestion';
import { useUpsertFormSteps } from '@/entities/formStep';
import {
  useFormInfoWatcher,
  useQuestionTextWatcher,
  useOptionTextWatcher,
  useStepTipsWatcher,
  useFlowNameWatcher,
} from './watchers';
import {
  createFormInfoHandler,
  createQuestionsHandler,
  createOptionsHandler,
  createStepsHandler,
  createFlowsHandler,
} from './handlers';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useAutoSaveController = createSharedComposable(() => {
  const { snapshot, restoreDirtyState, hasPendingChanges } = useDirtyTracker();
  const editor = useTimelineEditor();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  const saveStatus = ref<SaveStatus>('idle');
  const lastError = ref<Error | null>(null);

  // ============================================
  // Initialize GraphQL Composables (MUST be during setup)
  // ============================================
  // Apollo requires composables to be called during Vue component setup,
  // not inside async callbacks. We extract the mutation functions here.
  const { updateFormAutoSave } = useUpdateFormAutoSave();
  const { updateFormQuestion } = useUpdateFormQuestion();
  const { upsertFormSteps } = useUpsertFormSteps();

  // ============================================
  // Create Handler Functions (during setup)
  // ============================================
  // Handler factories create closures with mutation functions pre-bound
  const saveFormInfo = createFormInfoHandler(updateFormAutoSave);
  const saveQuestions = createQuestionsHandler(updateFormQuestion);
  const saveOptions = createOptionsHandler();
  const saveSteps = createStepsHandler(upsertFormSteps);
  const saveFlows = createFlowsHandler();

  // ============================================
  // Register Watchers
  // ============================================
  // These watchers detect text field changes and mark entities as dirty
  useFormInfoWatcher();
  useQuestionTextWatcher();
  useOptionTextWatcher();
  useStepTipsWatcher();
  useFlowNameWatcher();

  // ============================================
  // Save Execution
  // ============================================

  /**
   * Execute save for all dirty entities.
   *
   * Critical flow:
   * 1. Capture dirty state snapshot ATOMICALLY (before clearing)
   * 2. Clear dirty state immediately (prevents duplicate saves)
   * 3. Run all applicable handlers in PARALLEL
   * 4. On error: restore dirty state so retry is possible
   */
  const executeSave = async () => {
    if (!hasPendingChanges.value) return;

    const formId = editor.currentFormId.value;
    const organizationId = currentOrganizationId.value;

    if (!formId || !organizationId) {
      console.warn('[AutoSave] Cannot save: missing formId or organizationId');
      return;
    }

    // Transition to saving state
    saveStatus.value = 'saving';
    lastError.value = null;

    // ATOMIC: Capture current dirty state and clear it
    // This prevents race conditions where new changes during save
    // would be lost when clearing after save completes
    const toSave = snapshot();

    try {
      const promises: Promise<void>[] = [];

      // Queue applicable handlers for parallel execution
      if (toSave.formInfo) {
        promises.push(saveFormInfo(formId));
      }
      if (toSave.questions.size > 0) {
        promises.push(saveQuestions(toSave.questions));
      }
      if (toSave.options.size > 0) {
        promises.push(saveOptions(toSave.options));
      }
      if (toSave.steps.size > 0) {
        promises.push(saveSteps(toSave.steps, organizationId));
      }
      if (toSave.flows.size > 0) {
        promises.push(saveFlows(toSave.flows));
      }

      // Execute all saves in parallel
      await Promise.all(promises);

      // SUCCESS: Transition to saved state
      saveStatus.value = 'saved';

      // Auto-reset to idle after 2 seconds
      setTimeout(() => {
        if (saveStatus.value === 'saved') {
          saveStatus.value = 'idle';
        }
      }, 2000);

    } catch (error) {
      // ERROR: Restore dirty state so user can retry
      // This prevents data loss when save fails
      saveStatus.value = 'error';
      lastError.value = error instanceof Error ? error : new Error(String(error));
      console.error('[AutoSave] Save failed:', error);

      // CRITICAL: Restore the captured dirty state
      // Without this, changes would be lost on error
      restoreDirtyState(toSave);
    }
  };

  // ============================================
  // Debounced Save Trigger
  // ============================================

  // 500ms debounce for batching rapid typing
  const debouncedSave = useDebounceFn(executeSave, 500);

  // Watch for pending changes and trigger debounced save
  watch(hasPendingChanges, (pending) => {
    if (pending) {
      debouncedSave();
    }
  });

  // ============================================
  // Manual Save (for immediate save needs)
  // ============================================

  /**
   * Force an immediate save without debouncing.
   * Useful for save before navigation or explicit save button.
   *
   * Note: The pending debounced save will still fire but will be a no-op
   * since executeSave clears dirty state atomically before saving.
   */
  const saveNow = async () => {
    await executeSave();
  };

  // ============================================
  // Public API
  // ============================================

  return {
    // Status (readonly to prevent external modification)
    saveStatus: readonly(saveStatus),
    lastError: readonly(lastError),
    hasPendingChanges,

    // Actions
    saveNow,
  };
});
