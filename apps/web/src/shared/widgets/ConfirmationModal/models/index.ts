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
  | 'archive_testimonial'
  | 'reject_testimonial'
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
