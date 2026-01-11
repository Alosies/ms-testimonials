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

import { ref, readonly, toRefs, nextTick } from 'vue';
import { createSharedComposable, useIdle, whenever } from '@vueuse/core';
import { useDirtyTracker } from './useDirtyTracker';
import { useSaveLock } from './useSaveLock';
import { useTimelineEditor } from '../timeline/useTimelineEditor';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useUpdateFormAutoSave } from '@/entities/form';
import { useUpdateFormQuestionAutoSave } from '@/entities/formQuestion';
import { useUpdateFormStepAutoSave } from '@/entities/formStep';
import {
  useFormInfoWatcher,
  useQuestionTextWatcher,
  useOptionTextWatcher,
  useStepTipsWatcher,
  useStepContentWatcher,
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
  const { isLocked, acquireLock, releaseLock } = useSaveLock();
  const editor = useTimelineEditor();
  const contextStore = useCurrentContextStore();
  const { currentOrganizationId } = toRefs(contextStore);

  // useIdle detects when user stops all interaction for 500ms
  // Events tracked: mousemove, mousedown, resize, keydown, touchstart, wheel
  const { idle } = useIdle(500);

  const saveStatus = ref<SaveStatus>('idle');
  const lastError = ref<Error | null>(null);

  // ============================================
  // Initialize GraphQL Composables (MUST be during setup)
  // ============================================
  // Apollo requires composables to be called during Vue component setup,
  // not inside async callbacks. We extract the mutation functions here.
  //
  // IMPORTANT: All composables use minimal response pattern (id + updated_at only)
  // to prevent Apollo cache from overwriting local state. See ADR-003 and ADR-010.
  const { updateFormAutoSave } = useUpdateFormAutoSave();
  const { updateFormQuestionAutoSave } = useUpdateFormQuestionAutoSave();
  const { updateFormStepAutoSave } = useUpdateFormStepAutoSave();

  // ============================================
  // Create Handler Functions (during setup)
  // ============================================
  // Handler factories create closures with mutation functions pre-bound
  const saveFormInfo = createFormInfoHandler(updateFormAutoSave);
  const saveQuestions = createQuestionsHandler(updateFormQuestionAutoSave);
  const saveOptions = createOptionsHandler();
  const saveSteps = createStepsHandler(updateFormStepAutoSave);
  const saveFlows = createFlowsHandler();

  // ============================================
  // Register Watchers
  // ============================================
  // These watchers detect text field changes and mark entities as dirty
  useFormInfoWatcher();
  useQuestionTextWatcher();
  useOptionTextWatcher();
  useStepTipsWatcher();
  useStepContentWatcher(); // Welcome, ThankYou, Consent step content
  useFlowNameWatcher();

  // ============================================
  // Save Execution
  // ============================================

  /**
   * Execute save for all dirty entities.
   *
   * Critical flow:
   * 1. Check if lock is held (immediate save in progress) - skip if so
   * 2. Try to acquire lock - skip if unavailable
   * 3. Capture dirty state snapshot ATOMICALLY (before clearing)
   * 4. Clear dirty state immediately (prevents duplicate saves)
   * 5. Run all applicable handlers in PARALLEL
   * 6. On error: restore dirty state so retry is possible
   * 7. Release lock in finally block
   */
  const executeSave = async () => {
    // Skip if already locked (immediate save in progress)
    if (isLocked.value) {
      console.log('[AutoSave] Skipped - immediate save in progress');
      return;
    }

    if (!hasPendingChanges.value) return;

    const formId = editor.currentFormId.value;
    const organizationId = currentOrganizationId.value;

    if (!formId || !organizationId) {
      console.warn('[AutoSave] Cannot save: missing formId or organizationId');
      return;
    }

    // Try to acquire lock - skip if unavailable (dirty state preserved)
    if (!acquireLock('auto-save')) {
      console.log('[AutoSave] Could not acquire lock');
      return;
    }

    try {
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
          promises.push(saveSteps(toSave.steps));
        }
        if (toSave.flows.size > 0) {
          promises.push(saveFlows(toSave.flows));
        }

        // Execute all saves in parallel
        await Promise.all(promises);

        // Transition: saving → saved → idle
        saveStatus.value = 'saved';
        await nextTick();
        saveStatus.value = 'idle';

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
    } finally {
      releaseLock();
    }
  };

  // ============================================
  // Idle-Based Save Trigger
  // ============================================

  // Save when BOTH conditions are true:
  // 1. User has been idle for 500ms (no keyboard/mouse activity)
  // 2. There are pending changes to save
  //
  // Using `whenever` instead of `watch` because:
  // - It fires when the condition BECOMES true (not just on transitions)
  // - Handles edge case where user is already idle when changes are made
  // - Prevents multiple saves during rapid typing
  whenever(
    () => idle.value && hasPendingChanges.value,
    () => executeSave()
  );

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
