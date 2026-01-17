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
} as const;

export type StudioTestId = typeof studioTestIds;
