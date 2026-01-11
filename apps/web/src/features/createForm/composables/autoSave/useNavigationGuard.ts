/**
 * Navigation Guard for Auto-Save
 *
 * Prevents data loss by warning users before:
 * 1. Closing or refreshing the browser tab (beforeunload event)
 * 2. Navigating to a different route (Vue Router guard)
 *
 * Only triggers warnings when there are pending unsaved changes.
 *
 * Usage:
 * - Call this composable in the FormStudioPage component setup
 * - It automatically registers and cleans up the guards
 */

import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useDirtyTracker } from './useDirtyTracker';
import { useAutoSaveController } from './useAutoSaveController';

export const useNavigationGuard = () => {
  const { hasPendingChanges } = useDirtyTracker();
  const { saveNow } = useAutoSaveController();

  // ============================================
  // Browser Close/Refresh Guard
  // ============================================

  /**
   * Handler for browser beforeunload event.
   * Shows the native browser dialog when there are unsaved changes.
   *
   * Note: Modern browsers ignore custom messages and show a generic
   * "Changes you made may not be saved" dialog.
   */
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasPendingChanges.value) {
      // Standard way to trigger the browser's native dialog
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = '';
    }
  };

  // Register beforeunload listener on mount
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  // Clean up listener on unmount
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  // ============================================
  // Vue Router Navigation Guard
  // ============================================

  /**
   * Vue Router guard for in-app navigation.
   * Shows a confirm dialog when navigating away with unsaved changes.
   *
   * If user confirms, attempts to save before navigating.
   * If user cancels, stays on the current page.
   */
  onBeforeRouteLeave(async (_to, _from, next) => {
    if (hasPendingChanges.value) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );

      if (!confirmed) {
        // User chose to stay - cancel navigation
        return next(false);
      }

      // User confirmed leaving - try to save first
      try {
        await saveNow();
      } catch (error) {
        // Save failed but user confirmed leaving, so continue
        console.warn('[NavigationGuard] Save failed before navigation:', error);
      }
    }

    // No pending changes or user confirmed - proceed with navigation
    next();
  });
};
