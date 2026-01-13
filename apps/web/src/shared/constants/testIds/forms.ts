export const formsTestIds = {
  // Forms list page
  formsList: 'forms-list',
  formsListItem: 'forms-list-item',
  formsCreateButton: 'forms-create-button',
  formsEmptyState: 'forms-empty-state',

  // Create form modal/page
  createFormModal: 'forms-create-modal',
  createFormNameInput: 'forms-create-name-input',
  createFormSubmitButton: 'forms-create-submit-button',
  createFormCancelButton: 'forms-create-cancel-button',
} as const;

export type FormsTestId = typeof formsTestIds;
