/**
 * Intent types for confirmation modals
 * - danger: Red color scheme (delete, remove actions)
 * - warning: Amber/orange color scheme (archive, disable actions)
 * - info: Blue color scheme (informational confirmations)
 */
export type ConfirmationIntent = 'danger' | 'warning' | 'info';

/**
 * Supported action types with predefined messages
 */
export type ConfirmationActionType =
  | 'delete_form'
  | 'delete_widget'
  | 'delete_testimonial'
  | 'delete_question'
  | 'delete_step'
  | 'delete_step_blocked'
  | 'archive_testimonial'
  | 'reject_testimonial'
  | 'regenerate_questions'
  | 'custom';

export interface ConfirmationMessage {
  title: string;
  message: string;
  confirmText: string;
  warningText?: string;
  intent: ConfirmationIntent;
}

export interface ConfirmationOptions {
  actionType: ConfirmationActionType;
  entityName: string;
  onConfirm: () => void | Promise<void>;
  customMessage?: Partial<ConfirmationMessage>;
}

/**
 * Options for blocked/info-only modals.
 * These modals don't have a confirm action - just acknowledge with "Got it".
 */
export interface BlockedMessageOptions {
  actionType: ConfirmationActionType;
  entityName: string;
  customMessage?: Partial<ConfirmationMessage>;
}
