import type { ConfirmationMessage, ConfirmationActionType } from '../models';

export const CONFIRMATION_MESSAGES: Record<
  Exclude<ConfirmationActionType, 'custom'>,
  ConfirmationMessage
> = {
  // Danger actions (red)
  delete_form: {
    title: 'Delete Form',
    message:
      'Are you sure you want to delete this form? This action cannot be undone and will remove all associated questions and collected testimonials.',
    confirmText: 'Delete Form',
    warningText: 'will be permanently deleted.',
    intent: 'danger',
  },
  delete_widget: {
    title: 'Delete Widget',
    message:
      'Are you sure you want to delete this widget? This action cannot be undone and any embedded widgets will stop working.',
    confirmText: 'Delete Widget',
    warningText: 'will be permanently deleted.',
    intent: 'danger',
  },
  delete_testimonial: {
    title: 'Delete Testimonial',
    message:
      'Are you sure you want to delete this testimonial? This action cannot be undone.',
    confirmText: 'Delete Testimonial',
    warningText: 'will be permanently deleted.',
    intent: 'danger',
  },
  delete_question: {
    title: 'Delete Question',
    message:
      'Are you sure you want to delete this question? This action cannot be undone.',
    confirmText: 'Delete Question',
    warningText: 'will be permanently deleted.',
    intent: 'danger',
  },
  delete_step: {
    title: 'Delete Step',
    message:
      'Are you sure you want to delete this step? This action cannot be undone.',
    confirmText: 'Delete Step',
    warningText: 'will be permanently deleted.',
    intent: 'danger',
  },
  delete_step_blocked: {
    title: 'Cannot Delete Step',
    message:
      'This step is used as the branching point for conditional flows. To delete it, first disable branching or select a different question for branching.',
    confirmText: 'Got it',
    warningText: 'is used for branching.',
    intent: 'info',
  },

  // Warning actions (amber/orange)
  archive_testimonial: {
    title: 'Archive Testimonial',
    message:
      'Are you sure you want to archive this testimonial? It will be hidden from widgets but can be restored later.',
    confirmText: 'Archive',
    warningText: 'will be archived.',
    intent: 'warning',
  },
  reject_testimonial: {
    title: 'Reject Testimonial',
    message:
      'Are you sure you want to reject this testimonial? The customer will not be notified.',
    confirmText: 'Reject',
    warningText: 'will be rejected.',
    intent: 'warning',
  },
  regenerate_questions: {
    title: 'Regenerate Questions?',
    message:
      'This will replace all current questions with new AI-generated ones. Any edits you made will be lost.',
    confirmText: 'Regenerate',
    warningText: 'All questions will be replaced.',
    intent: 'warning',
  },
} as const;

/**
 * Color scheme configurations for each intent
 */
export const INTENT_STYLES = {
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    warningBg: 'bg-red-50',
    warningBorder: 'border-red-200',
    warningText: 'text-red-800',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
    loadingText: 'Deleting...',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    warningBg: 'bg-amber-50',
    warningBorder: 'border-amber-200',
    warningText: 'text-amber-800',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    loadingText: 'Processing...',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    warningBg: 'bg-blue-50',
    warningBorder: 'border-blue-200',
    warningText: 'text-blue-800',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    loadingText: 'Processing...',
  },
} as const;
