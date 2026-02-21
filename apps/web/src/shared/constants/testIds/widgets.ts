export const widgetsTestIds = {
  // Widgets List Page
  listPage: 'widgets-list-page',
  listPageTitle: 'widgets-list-title',
  listCreateButton: 'widgets-list-create-button',
  emptyState: 'widgets-empty-state',
  emptyStateCreateButton: 'widgets-empty-create-button',
  listSkeleton: 'widgets-list-skeleton',
  widgetCard: 'widget-card',
  widgetCardName: 'widget-card-name',
  widgetCardType: 'widget-card-type',
  widgetCardDeleteButton: 'widget-card-delete-button',

  // Widget Builder
  builderPage: 'widget-builder-page',
  builderTitle: 'widget-builder-title',
  builderBackButton: 'widget-builder-back-button',
  builderSaveButton: 'widget-builder-save-button',
  builderEmbedButton: 'widget-builder-embed-button',

  // Type Selector
  typeSelector: 'widget-type-selector',
  typeOption: 'widget-type-option',

  // Settings Panel
  nameInput: 'widget-name-input',
  themeLight: 'widget-theme-light',
  themeDark: 'widget-theme-dark',
  switchShowRatings: 'widget-switch-show-ratings',
  switchShowDates: 'widget-switch-show-dates',
  switchShowCompany: 'widget-switch-show-company',
  switchShowAvatar: 'widget-switch-show-avatar',
  switchIsActive: 'widget-switch-is-active',
  maxDisplayInput: 'widget-max-display-input',

  // Preview
  preview: 'widget-preview',

  // Embed Modal
  embedModal: 'widget-embed-modal',
  embedCode: 'widget-embed-code',
  embedCopyButton: 'widget-embed-copy-button',

  // Confirmation Modal
  confirmationModal: 'confirmation-modal',
  confirmationModalTitle: 'confirmation-modal-title',
  confirmationModalMessage: 'confirmation-modal-message',
  confirmationModalConfirmButton: 'confirmation-modal-confirm-button',
  confirmationModalCancelButton: 'confirmation-modal-cancel-button',
  confirmationModalAcknowledgeButton: 'confirmation-modal-acknowledge-button',
} as const;

export type WidgetsTestId = typeof widgetsTestIds;
