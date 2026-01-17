/**
 * Timeline Persistence - Save coordination composable (ADR-014 Phase 5)
 *
 * Single-responsibility composable for persistence coordination.
 * Composes from useSaveLock and useDirtyTracker.
 */
import { ref, computed, type Ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import { useSaveLock } from '../autoSave/useSaveLock';
import { useDirtyTracker } from '../autoSave/useDirtyTracker';
import { useTimelineState } from './useTimelineState';
import type { TimelinePersistence } from '../../models/timeline';

// Re-export type for consumers (CR-002: types from models/)
export type { TimelinePersistence } from '../../models/timeline';

// =============================================================================
// Composable Implementation
// =============================================================================

export const useTimelinePersistence = createSharedComposable((): TimelinePersistence => {
  const saveLock = useSaveLock();
  const dirtyTracker = useDirtyTracker();
  const state = useTimelineState();

  const _isSaving = ref(false);

  // Computed: is saving
  const isSaving = computed(() => _isSaving.value || saveLock.isLocked.value);

  // Computed: has pending step changes
  const hasPendingStepChanges = computed(() => dirtyTracker.dirty.steps.size > 0);

  // Mark step dirty
  function markStepDirty(stepId: string): void {
    dirtyTracker.mark.step(stepId);
  }

  // Check if step is dirty
  function isStepDirty(stepId: string): boolean {
    return dirtyTracker.dirty.steps.has(stepId);
  }

  // Capture and clear dirty state
  function snapshotDirtyState() {
    return dirtyTracker.snapshot();
  }

  // Execute with lock
  async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    _isSaving.value = true;
    try {
      return await saveLock.withLock(key, fn);
    } finally {
      _isSaving.value = false;
    }
  }

  // Mark state as clean
  function markClean(): void {
    state.markClean();
  }

  // Get all dirty step IDs
  function getDirtyStepIds(): string[] {
    return Array.from(dirtyTracker.dirty.steps);
  }

  return {
    isSaving,
    lockReason: saveLock.lockReason as Ref<string | null>,
    hasPendingStepChanges,
    markStepDirty,
    isStepDirty,
    withLock,
    markClean,
    getDirtyStepIds,
    snapshotDirtyState,
  };
});
