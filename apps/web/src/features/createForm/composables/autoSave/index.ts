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
 *
 * Usage in FormStudioPage:
 * ```typescript
 * const autoSave = useAutoSaveController();
 * useNavigationGuard();
 *
 * // Pass status to header
 * <FormEditorHeader :save-status="autoSave.saveStatus.value" />
 * ```
 */

export { useDirtyTracker } from './useDirtyTracker';
export { useAutoSaveController, type SaveStatus } from './useAutoSaveController';
export { useNavigationGuard } from './useNavigationGuard';
