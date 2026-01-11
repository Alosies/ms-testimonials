/**
 * Auto-Save Module
 *
 * Centralized auto-save system for the Form Studio.
 * Replaces the fragmented auto-save composables with a unified controller.
 *
 * Public API:
 * - useDirtyTracker: Shared dirty state tracking (internal use by watchers/controller)
 * - useAutoSaveController: Main controller - initializes watchers and orchestrates saves
 * - useNavigationGuard: Prevents data loss on navigation
 * - useSaveLock: Coordinates immediate and debounced saves
 *
 * Usage in FormStudioPage:
 * ```typescript
 * const autoSave = useAutoSaveController();
 * useNavigationGuard();
 *
 * // Pass status to header
 * <FormEditorHeader :save-status="autoSave.saveStatus.value" />
 * ```
 *
 * Usage for immediate saves:
 * ```typescript
 * const { withLock, isLocked } = useSaveLock();
 * await withLock('add-step', async () => { ... });
 * ```
 */

export { useDirtyTracker } from './useDirtyTracker';
// Note: SaveStatus type is re-exported from models/index.ts to avoid duplication
export { useAutoSaveController } from './useAutoSaveController';
export { useNavigationGuard } from './useNavigationGuard';
export { useSaveLock } from './useSaveLock';
