/**
 * Save Lock - Coordinates immediate and debounced saves
 *
 * Prevents race conditions between immediate saves (discrete actions)
 * and debounced saves (text content). Uses createSharedComposable
 * for singleton pattern across all composables.
 *
 * Usage:
 * - Immediate saves: await withLock('add-step', async () => { ... })
 * - Auto-save controller: check isLocked before executing
 */
import { ref, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';

export const useSaveLock = createSharedComposable(() => {
  const isLocked = ref(false);
  const lockReason = ref<string | null>(null);

  const acquireLock = (reason: string): boolean => {
    if (isLocked.value) return false;
    isLocked.value = true;
    lockReason.value = reason;
    return true;
  };

  const releaseLock = () => {
    isLocked.value = false;
    lockReason.value = null;
  };

  /**
   * Execute a function with exclusive save lock.
   * Throws if lock is already held (defensive - UI should prevent this).
   */
  const withLock = async <T>(reason: string, fn: () => Promise<T>): Promise<T> => {
    if (!acquireLock(reason)) {
      throw new Error(`Save in progress: ${lockReason.value}`);
    }
    try {
      return await fn();
    } finally {
      releaseLock();
    }
  };

  return {
    isLocked: readonly(isLocked),
    lockReason: readonly(lockReason),
    withLock,
    acquireLock,
    releaseLock,
  };
});
