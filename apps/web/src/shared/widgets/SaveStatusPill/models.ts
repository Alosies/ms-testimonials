/**
 * Save status states for the SaveStatusPill component
 *
 * - idle: No changes, nothing to show
 * - unsaved: Has unsaved changes (shows amber pill with "Unsaved" + kbd hint)
 * - saving: Save in progress (shows amber pill with spinner)
 * - saved: Just saved successfully (shows green pill with checkmark, typically auto-hides)
 * - error: Save failed (shows red pill with error)
 */
export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';
