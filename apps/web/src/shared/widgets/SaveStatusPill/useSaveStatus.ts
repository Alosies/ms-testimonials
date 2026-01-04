import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { SaveStatus } from './models';

export interface UseSaveStatusOptions {
  /** Reactive ref indicating if there are unsaved changes */
  isDirty: Ref<boolean> | ComputedRef<boolean>;
  /** Reactive ref indicating if save is in progress */
  isSaving: Ref<boolean> | ComputedRef<boolean>;
  /** Duration to show "Saved" state before returning to idle (ms) */
  savedDuration?: number;
}

/**
 * Composable to manage save status transitions
 *
 * Handles the state machine:
 * - idle → unsaved (when isDirty becomes true)
 * - unsaved → saving (when isSaving becomes true)
 * - saving → saved (when isSaving becomes false and isDirty is false)
 * - saved → idle (after savedDuration)
 * - Any state → error (on error)
 */
export function useSaveStatus(options: UseSaveStatusOptions) {
  const { isDirty, isSaving, savedDuration = 1500 } = options;

  const hasError = ref(false);
  const justSaved = ref(false);

  // Compute the current status based on state
  const status = computed<SaveStatus>(() => {
    if (hasError.value) return 'error';
    if (justSaved.value) return 'saved';
    if (isSaving.value) return 'saving';
    if (isDirty.value) return 'unsaved';
    return 'idle';
  });

  // Watch for save completion (was saving, now not saving, and not dirty)
  watch(
    [isSaving, isDirty],
    ([newSaving, newDirty], [oldSaving]) => {
      // Save just completed successfully
      if (oldSaving && !newSaving && !newDirty && !hasError.value) {
        justSaved.value = true;
        setTimeout(() => {
          justSaved.value = false;
        }, savedDuration);
      }
    }
  );

  /**
   * Set error state (call on save failure)
   */
  function setError(error: boolean = true) {
    hasError.value = error;
  }

  /**
   * Clear error state
   */
  function clearError() {
    hasError.value = false;
  }

  return {
    status,
    justSaved,
    hasError,
    setError,
    clearError,
  };
}
