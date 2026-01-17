/**
 * Studio Page Object
 *
 * Page object for the Form Studio editor. Provides locators and actions
 * for interacting with the form builder UI.
 *
 * ## Selector Strategy
 * Uses dual-attribute pattern for element selection:
 * - `data-testid` identifies UI component type (e.g., "studio-sidebar-step-card")
 * - `data-step-id` identifies specific domain entity (e.g., step's database ID)
 *
 * @see /.claude/skills/e2e-test-ids/SKILL.md for full documentation
 */
import { Page, expect, Locator } from '@playwright/test';
import { studioTestIds, widgetsTestIds } from '@/shared/constants/testIds';

export function createStudioPage(page: Page) {
  // Locators using centralized test IDs
  const sidebar = page.getByTestId(studioTestIds.sidebar);
  const canvas = page.getByTestId(studioTestIds.canvas);
  const canvasEmpty = page.getByTestId(studioTestIds.canvasEmptyState);
  const stepCards = page.getByTestId(studioTestIds.sidebarStepCard);
  const canvasStepCards = page.getByTestId(studioTestIds.canvasStepCard);
  const sidebarAddButton = page.getByTestId(studioTestIds.sidebarAddButton);
  const canvasAddButton = page.getByTestId(studioTestIds.canvasAddButton);
  const saveStatus = page.getByTestId(studioTestIds.headerSaveStatus);
  const propertiesPanel = page.getByTestId(studioTestIds.propertiesPanel);
  const propertiesStepTypeHeading = page.getByTestId(studioTestIds.propertiesStepTypeHeading);
  const propertiesContextualHelp = page.getByTestId(studioTestIds.propertiesContextualHelp);
  const propertiesBranchingSettings = page.getByTestId(studioTestIds.propertiesBranchingSettings);
  const propertiesDesignSettings = page.getByTestId(studioTestIds.propertiesDesignSettings);

  // Confirmation modal locators
  const confirmationModal = page.getByTestId(widgetsTestIds.confirmationModal);
  const confirmationModalConfirmButton = page.getByTestId(widgetsTestIds.confirmationModalConfirmButton);
  const confirmationModalCancelButton = page.getByTestId(widgetsTestIds.confirmationModalCancelButton);

  // Step Editor locators (slide-in editor opened via E key)
  const stepEditor = page.getByTestId(studioTestIds.stepEditor);
  const stepEditorTitle = page.getByTestId(studioTestIds.stepEditorTitle);

  /**
   * Get sidebar step card by step ID (domain identifier)
   * Uses combined selector: data-testid + data-step-id
   */
  function getSidebarStepCard(stepId: string): Locator {
    return page.locator(`[data-testid="${studioTestIds.sidebarStepCard}"][data-step-id="${stepId}"]`);
  }

  /**
   * Get canvas step card by step ID (domain identifier)
   * Uses combined selector: data-testid + data-step-id
   */
  function getCanvasStepCard(stepId: string): Locator {
    return page.locator(`[data-testid="${studioTestIds.canvasStepCard}"][data-step-id="${stepId}"]`);
  }

  /**
   * Get any step card (sidebar or canvas) by step ID
   */
  function getStepCardById(stepId: string): Locator {
    return page.locator(`[data-step-id="${stepId}"]`);
  }

  return {
    // Expose page and locators
    page,
    sidebar,
    canvas,
    canvasEmpty,
    stepCards,
    canvasStepCards,
    sidebarAddButton,
    canvasAddButton,
    saveStatus,
    propertiesPanel,
    propertiesStepTypeHeading,
    propertiesContextualHelp,
    propertiesBranchingSettings,
    propertiesDesignSettings,
    confirmationModal,
    confirmationModalConfirmButton,
    confirmationModalCancelButton,
    stepEditor,
    stepEditorTitle,

    // Entity-based locators (by domain ID)
    getSidebarStepCard,
    getCanvasStepCard,
    getStepCardById,

    // Navigation
    async goto(orgSlug: string, formSlug: string) {
      await page.goto(`/${orgSlug}/forms/${formSlug}/studio`);
      await sidebar.waitFor({ timeout: 10000 });
    },

    // Actions
    async selectStep(index: number) {
      await stepCards.nth(index).click();
    },

    /**
     * Select a step by its ID (clicks sidebar step card)
     * @param stepId - The step's database ID
     */
    async selectStepById(stepId: string) {
      await getSidebarStepCard(stepId).click();
    },

    /**
     * Add a step to the form.
     * Uses canvas add button for empty forms, sidebar add button otherwise.
     * Opens step type picker and selects the specified type (defaults to Question).
     */
    async addStep(type: 'Welcome' | 'Question' | 'Rating' | 'Consent' | 'Contact Info' | 'Reward' | 'Thank You' = 'Question') {
      // Use canvas button if empty state is visible, otherwise use sidebar
      const canvasVisible = await canvasAddButton.isVisible().catch(() => false);
      if (canvasVisible) {
        await canvasAddButton.click();
      } else {
        await sidebarAddButton.click();
      }

      // Wait for dropdown to appear and select step type
      await page.getByRole('menuitem', { name: new RegExp(type, 'i') }).click();

      // Wait for step to be added
      await page.waitForTimeout(500); // Brief wait for UI update
    },

    // Assertions
    async expectLoaded(options?: { timeout?: number }) {
      const timeout = options?.timeout ?? 15000;
      // Wait for the studio layout containers to be visible
      await expect(sidebar).toBeVisible({ timeout });
      await expect(canvas).toBeVisible({ timeout });
      // Wait for either step cards OR empty state to be visible
      const hasContent = stepCards.first().or(canvasEmpty);
      await expect(hasContent).toBeVisible({ timeout });
    },

    async expectStepCount(count: number, options?: { timeout?: number }) {
      await expect(stepCards).toHaveCount(count, options);
    },

    /**
     * Expect at least a minimum number of steps
     */
    async expectMinStepCount(minCount: number, options?: { timeout?: number }) {
      await expect(async () => {
        const count = await stepCards.count();
        expect(count).toBeGreaterThanOrEqual(minCount);
      }).toPass(options);
    },

    /**
     * Expect at least a minimum number of canvas step cards
     */
    async expectMinCanvasStepCount(minCount: number, options?: { timeout?: number }) {
      await expect(async () => {
        const count = await canvasStepCards.count();
        expect(count).toBeGreaterThanOrEqual(minCount);
      }).toPass(options);
    },

    /**
     * Get current step count
     */
    async getStepCount(): Promise<number> {
      return await stepCards.count();
    },

    /**
     * Get current canvas step count
     */
    async getCanvasStepCount(): Promise<number> {
      return await canvasStepCards.count();
    },

    async expectSaved() {
      await expect(saveStatus).toContainText(/saved/i);
    },

    async expectSaving() {
      await expect(saveStatus).toContainText(/saving/i);
    },

    // ==========================================
    // Navigation Methods (for navigation tests)
    // ==========================================

    /**
     * Press keyboard navigation key
     * @param key - Navigation key (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
     */
    async pressNavigationKey(key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
      await page.keyboard.press(key);
    },

    /**
     * Navigate up (previous step)
     */
    async navigateUp() {
      await page.keyboard.press('ArrowUp');
    },

    /**
     * Navigate down (next step)
     */
    async navigateDown() {
      await page.keyboard.press('ArrowDown');
    },

    /**
     * Navigate left (switch to testimonial branch or previous flow)
     */
    async navigateLeft() {
      await page.keyboard.press('ArrowLeft');
    },

    /**
     * Navigate right (switch to improvement branch or next flow)
     */
    async navigateRight() {
      await page.keyboard.press('ArrowRight');
    },

    /**
     * Expand current flow (F key)
     */
    async expandFlow() {
      await page.keyboard.press('f');
    },

    /**
     * Collapse expanded flow (Escape key)
     */
    async collapseFlow() {
      await page.keyboard.press('Escape');
    },

    // ==========================================
    // Keyboard Shortcut Methods
    // ==========================================

    /**
     * Press 'E' key to edit the currently selected step
     * Opens the properties panel / step editor for the selected step
     */
    async pressEditKey() {
      await page.keyboard.press('e');
    },

    /**
     * Press delete shortcut (Cmd+D on Mac, Ctrl+D on Windows/Linux)
     * Triggers deletion confirmation modal for the selected step
     */
    async pressDeleteShortcut() {
      // Playwright handles cross-platform modifier with ControlOrMeta
      await page.keyboard.press('ControlOrMeta+d');
    },

    // ==========================================
    // Confirmation Modal Methods
    // ==========================================

    /**
     * Click confirm button in the confirmation modal
     */
    async confirmDelete() {
      await confirmationModalConfirmButton.click();
    },

    /**
     * Click cancel button in the confirmation modal
     */
    async cancelDelete() {
      await confirmationModalCancelButton.click();
    },

    /**
     * Expect confirmation modal to be visible
     */
    async expectConfirmationModalVisible(options?: { timeout?: number }) {
      await expect(confirmationModal).toBeVisible(options);
    },

    /**
     * Expect confirmation modal to be hidden
     */
    async expectConfirmationModalHidden(options?: { timeout?: number }) {
      await expect(confirmationModal).not.toBeVisible(options);
    },

    /**
     * Expect confirmation modal to have specific title text
     * @param title - Expected title text (partial match)
     */
    async expectConfirmationModalTitle(title: string, options?: { timeout?: number }) {
      const titleLocator = page.getByTestId(widgetsTestIds.confirmationModalTitle);
      await expect(titleLocator).toContainText(title, options);
    },

    // ==========================================
    // Step Editor Methods (slide-in opened via E key)
    // ==========================================

    /**
     * Expect step editor to be visible (opened)
     */
    async expectStepEditorVisible(options?: { timeout?: number }) {
      await expect(stepEditor).toBeVisible(options);
    },

    /**
     * Expect step editor to be hidden (closed)
     */
    async expectStepEditorHidden(options?: { timeout?: number }) {
      await expect(stepEditor).not.toBeVisible(options);
    },

    /**
     * Expect step editor title to contain specific text
     * @param title - Expected title text (partial match, e.g., "Welcome" or "Question")
     */
    async expectStepEditorTitle(title: string, options?: { timeout?: number }) {
      await expect(stepEditorTitle).toContainText(title, options);
    },

    /**
     * Expect step editor to be showing a specific step (by ID)
     * Validates both visibility and correct step content
     * @param stepId - The expected step's database ID
     */
    async expectStepEditorForStep(stepId: string, options?: { timeout?: number }) {
      await expect(stepEditor).toBeVisible(options);
      await expect(stepEditor).toHaveAttribute('data-step-id', stepId, options);
    },

    // ==========================================
    // Navigation Assertions
    // ==========================================

    /**
     * Expect a canvas step card to be in viewport (visible after scroll)
     * @param stepId - The step's database ID
     */
    async expectCanvasStepInViewport(stepId: string, options?: { timeout?: number }) {
      const canvasCard = getCanvasStepCard(stepId);
      await expect(canvasCard).toBeInViewport(options);
    },

    /**
     * Expect a sidebar step card to have active/selected state
     * Checks for ring-2 class which indicates selection
     * @param stepId - The step's database ID
     */
    async expectSidebarStepSelected(stepId: string, options?: { timeout?: number }) {
      const sidebarCard = getSidebarStepCard(stepId);
      await expect(sidebarCard).toHaveClass(/ring-2/, options);
    },

    /**
     * Expect a canvas step card to have active state
     * @param stepId - The step's database ID
     */
    async expectCanvasStepActive(stepId: string, options?: { timeout?: number }) {
      const canvasCard = getCanvasStepCard(stepId);
      // Active cards have ring-2 ring-primary classes
      await expect(canvasCard).toHaveClass(/ring-2/, options);
    },

    /**
     * Get the currently selected step ID from sidebar
     * Returns the data-step-id of the step card with ring-2 class
     */
    async getSelectedStepId(): Promise<string | null> {
      // ring-2 class is applied directly to the card element, not a descendant
      // so we need to filter by class on the element itself
      const selectedCard = page.locator(`[data-testid="${studioTestIds.sidebarStepCard}"].ring-2`).first();
      const isVisible = await selectedCard.isVisible().catch(() => false);
      if (!isVisible) return null;
      return await selectedCard.getAttribute('data-step-id');
    },

    /**
     * Wait for scroll to settle after navigation
     * Useful after clicking sidebar or keyboard navigation
     */
    async waitForScrollSettle(ms: number = 500) {
      await page.waitForTimeout(ms);
    },

    // ==========================================
    // Flow/Branch Focus Methods (for branched forms)
    // ==========================================

    /**
     * Get the flow column locator for a specific flow type
     * @param flowType - 'testimonial' or 'improvement'
     */
    getFlowColumn(flowType: 'testimonial' | 'improvement'): Locator {
      return page.locator(`[data-testid="${studioTestIds.flowColumn}"][data-flow-type="${flowType}"]`);
    },

    /**
     * Get the currently focused flow type
     * Returns 'testimonial', 'improvement', or null if no flow is focused
     */
    async getFocusedFlowType(): Promise<'testimonial' | 'improvement' | null> {
      const focusedColumn = page.locator(`[data-testid="${studioTestIds.flowColumn}"][data-is-focused="true"]`);
      const isVisible = await focusedColumn.isVisible().catch(() => false);
      if (!isVisible) return null;
      const flowType = await focusedColumn.getAttribute('data-flow-type');
      return flowType as 'testimonial' | 'improvement' | null;
    },

    /**
     * Expect a specific flow column to be focused
     * @param flowType - 'testimonial' or 'improvement'
     */
    async expectFlowFocused(flowType: 'testimonial' | 'improvement', options?: { timeout?: number }) {
      const flowColumn = page.locator(`[data-testid="${studioTestIds.flowColumn}"][data-flow-type="${flowType}"]`);
      await expect(flowColumn).toHaveAttribute('data-is-focused', 'true', options);
    },

    /**
     * Expect a flow column to NOT be focused
     * @param flowType - 'testimonial' or 'improvement'
     */
    async expectFlowNotFocused(flowType: 'testimonial' | 'improvement', options?: { timeout?: number }) {
      const flowColumn = page.locator(`[data-testid="${studioTestIds.flowColumn}"][data-flow-type="${flowType}"]`);
      await expect(flowColumn).toHaveAttribute('data-is-focused', 'false', options);
    },

    // ==========================================
    // Properties Panel Assertions
    // ==========================================

    /**
     * Expect properties panel to be visible (opened)
     */
    async expectPropertiesPanelVisible(options?: { timeout?: number }) {
      await expect(propertiesPanel).toBeVisible(options);
    },

    /**
     * Expect properties panel to be hidden (closed)
     */
    async expectPropertiesPanelHidden(options?: { timeout?: number }) {
      await expect(propertiesPanel).not.toBeVisible(options);
    },

    /**
     * Expect properties panel to show a specific step type
     * @param stepType - The expected step type title (e.g., "Welcome Step", "Question Step")
     */
    async expectPropertiesStepType(stepType: string, options?: { timeout?: number }) {
      await expect(propertiesStepTypeHeading).toContainText(stepType, options);
    },

    /**
     * Expect properties panel to show contextual help section
     */
    async expectContextualHelpVisible(options?: { timeout?: number }) {
      await expect(propertiesContextualHelp).toBeVisible(options);
    },

    /**
     * Expect properties panel to show branching settings section
     */
    async expectBranchingSettingsVisible(options?: { timeout?: number }) {
      await expect(propertiesBranchingSettings).toBeVisible(options);
    },

    /**
     * Expect properties panel to NOT show branching settings section
     */
    async expectBranchingSettingsHidden(options?: { timeout?: number }) {
      await expect(propertiesBranchingSettings).not.toBeVisible(options);
    },

    /**
     * Expect properties panel to show design settings section
     */
    async expectDesignSettingsVisible(options?: { timeout?: number }) {
      await expect(propertiesDesignSettings).toBeVisible(options);
    },
  };
}

export type StudioPage = ReturnType<typeof createStudioPage>;
