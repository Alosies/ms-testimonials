export const widgetsTestIds = {
  // Confirmation Modal
  confirmationModal: 'confirmation-modal',
  confirmationModalTitle: 'confirmation-modal-title',
  confirmationModalMessage: 'confirmation-modal-message',
  confirmationModalConfirmButton: 'confirmation-modal-confirm-button',
  confirmationModalCancelButton: 'confirmation-modal-cancel-button',
  confirmationModalAcknowledgeButton: 'confirmation-modal-acknowledge-button',
} as const;

export type WidgetsTestId = typeof widgetsTestIds;
