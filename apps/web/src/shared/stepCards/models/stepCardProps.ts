/**
 * Step Card Mode
 * - edit: Shows action buttons (edit, delete, reorder) for Form Studio
 * - preview: Clean read-only display for customer-facing form
 */
export type StepCardMode = 'edit' | 'preview';

/**
 * Props for the StepCardContainer component
 */
export interface StepCardContainerProps {
  /** Display mode - 'edit' shows action buttons, 'preview' is read-only */
  mode: StepCardMode;
  /** Whether this step is currently selected (edit mode only) */
  isSelected?: boolean;
  /** Step type identifier for styling */
  stepType: string;
}

/**
 * Emits for the StepCardContainer component
 */
export interface StepCardContainerEmits {
  /** Emitted when step is clicked (edit mode only) */
  (e: 'select'): void;
  /** Emitted when edit button clicked (edit mode only) */
  (e: 'edit'): void;
  /** Emitted when delete button clicked (edit mode only) */
  (e: 'delete'): void;
  /** Emitted when reorder button clicked (edit mode only) */
  (e: 'reorder', direction: 'up' | 'down'): void;
}
