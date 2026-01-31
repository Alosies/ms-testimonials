export const studioTestIds = {
  // Layout containers
  sidebar: 'studio-sidebar',
  canvas: 'studio-canvas',
  propertiesPanel: 'studio-properties-panel',
  header: 'studio-header',

  // Sidebar elements
  sidebarStepCard: 'studio-sidebar-step-card',
  sidebarAddButton: 'studio-sidebar-add-button',

  // Canvas elements
  canvasStepCard: 'studio-canvas-step-card',
  canvasEmptyState: 'studio-canvas-empty-state',
  canvasAddButton: 'studio-canvas-add-button',

  // Flow columns (for branched forms)
  flowColumn: 'studio-flow-column',
  expandedFlow: 'studio-expanded-flow',
  expandedFlowHeader: 'studio-expanded-flow-header',

  // Header elements
  headerSaveStatus: 'studio-header-save-status',
  headerBackButton: 'studio-header-back-button',
  headerPreviewButton: 'studio-header-preview-button',
  headerFormTitle: 'studio-header-form-title',

  // Step type menu
  stepTypeMenu: 'studio-step-type-menu',
  stepTypeOption: (type: string) => `studio-step-type-${type}`,

  // Properties panel elements
  propertiesTitleInput: 'studio-properties-title-input',
  propertiesDescriptionInput: 'studio-properties-description-input',

  // Properties panel sections
  propertiesStepTypeHeading: 'studio-properties-step-type-heading',
  propertiesContextualHelp: 'studio-properties-contextual-help',
  propertiesBranchingSettings: 'studio-properties-branching-settings',
  propertiesDesignSettings: 'studio-properties-design-settings',

  // Step Editor (slide-in editor opened via E key)
  stepEditor: 'studio-step-editor',
  stepEditorTitle: 'studio-step-editor-title',

  // Step card content elements (for auto-save validation)
  welcomeTitle: 'step-card-welcome-title',
  welcomeSubtitle: 'step-card-welcome-subtitle',
  welcomeButton: 'step-card-welcome-button',

  // Question step card content elements
  questionText: 'step-card-question-text',

  // Rating step editor fields
  ratingQuestionInput: 'rating-editor-question-input',
  ratingLowLabelInput: 'rating-editor-low-label-input',
  ratingHighLabelInput: 'rating-editor-high-label-input',
  ratingHelpTextInput: 'rating-editor-help-text-input',
  ratingRequiredSwitch: 'rating-editor-required-switch',

  // Consent step editor fields
  consentTitleInput: 'consent-editor-title-input',
  consentDescriptionInput: 'consent-editor-description-input',
  consentPublicLabelInput: 'consent-editor-public-label-input',
  consentPublicDescriptionInput: 'consent-editor-public-description-input',
  consentPrivateLabelInput: 'consent-editor-private-label-input',
  consentPrivateDescriptionInput: 'consent-editor-private-description-input',
  consentRequiredSwitch: 'consent-editor-required-switch',

  // Thank You step editor fields
  thankYouTitleInput: 'thankyou-editor-title-input',
  thankYouMessageInput: 'thankyou-editor-message-input',
  thankYouRedirectUrlInput: 'thankyou-editor-redirect-url-input',

  // Testimonial Write step editor fields
  testimonialWriteTitleInput: 'testimonial-write-editor-title-input',
  testimonialWriteSubtitleInput: 'testimonial-write-editor-subtitle-input',
  testimonialWritePlaceholderInput: 'testimonial-write-editor-placeholder-input',
  testimonialWriteMinLengthInput: 'testimonial-write-editor-min-length-input',
  testimonialWriteMaxLengthInput: 'testimonial-write-editor-max-length-input',
  testimonialWritePrevAnswersLabelInput: 'testimonial-write-editor-prev-answers-label-input',
  testimonialWriteAiTitleInput: 'testimonial-write-editor-ai-title-input',
  testimonialWriteAiDescriptionInput: 'testimonial-write-editor-ai-description-input',
  testimonialWriteManualTitleInput: 'testimonial-write-editor-manual-title-input',
  testimonialWriteManualDescriptionInput: 'testimonial-write-editor-manual-description-input',
  testimonialWriteEnableAiPathSwitch: 'testimonial-write-editor-enable-ai-path-switch',
  testimonialWriteShowPrevAnswersSwitch: 'testimonial-write-editor-show-prev-answers-switch',

  // Question type change workflow (ADR-017)
  questionTypeDropdown: 'question-editor-type-dropdown',
  questionOptionsSection: 'question-editor-options-section',
  questionOptionItem: 'question-editor-option-item',

  // Question type change warning dialog
  questionTypeChangeWarningDialog: 'question-type-change-warning-dialog',
  questionTypeChangeConfirmButton: 'question-type-change-confirm-button',
  questionTypeChangeCancelButton: 'question-type-change-cancel-button',

  // Question responses block (when responses exist)
  questionTypeResponsesBlockMessage: 'question-type-responses-block-message',
  deleteQuestionResponsesButton: 'delete-question-responses-button',
  // Note: Delete responses dialog uses shared ConfirmationModal (widgetsTestIds)
} as const;

export type StudioTestId = typeof studioTestIds;
