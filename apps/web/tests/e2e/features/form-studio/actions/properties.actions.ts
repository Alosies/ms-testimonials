/**
 * Studio Properties Panel Actions
 *
 * Actions for validating properties panel behavior based on step type selection.
 */
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestStep } from '@e2e/entities/form/types';

/**
 * Step type to expected panel title mapping
 */
export const STEP_TYPE_PANEL_TITLES: Record<string, string> = {
  welcome: 'Welcome Step',
  question: 'Question Step',
  rating: 'Rating Step',
  consent: 'Consent Step',
  contact_info: 'Contact Info Step',
  reward: 'Reward Step',
  thank_you: 'Thank You Step',
};

export function createPropertiesActions(studio: StudioPage) {
  return {
    /**
     * Select a step and verify the correct properties panel type is shown
     */
    async selectAndVerifyPanel(step: TestStep) {
      await studio.selectStepById(step.id);
      await studio.waitForScrollSettle();

      const expectedTitle = STEP_TYPE_PANEL_TITLES[step.stepType];
      if (expectedTitle) {
        await studio.expectPropertiesStepType(expectedTitle);
      }
    },

    /**
     * Verify welcome step panel shows correct content
     */
    async verifyWelcomePanel() {
      await studio.expectPropertiesStepType('Welcome Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsHidden();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify question step panel shows correct content
     */
    async verifyQuestionPanel() {
      await studio.expectPropertiesStepType('Question Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsHidden();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify rating step panel shows correct content
     */
    async verifyRatingPanel() {
      await studio.expectPropertiesStepType('Rating Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsVisible();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify consent step panel shows correct content
     */
    async verifyConsentPanel() {
      await studio.expectPropertiesStepType('Consent Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsHidden();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify contact info step panel shows correct content
     */
    async verifyContactInfoPanel() {
      await studio.expectPropertiesStepType('Contact Info Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsHidden();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify reward step panel shows correct content
     */
    async verifyRewardPanel() {
      await studio.expectPropertiesStepType('Reward Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsHidden();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify thank you step panel shows correct content
     */
    async verifyThankYouPanel() {
      await studio.expectPropertiesStepType('Thank You Step');
      await studio.expectContextualHelpVisible();
      await studio.expectBranchingSettingsHidden();
      await studio.expectDesignSettingsVisible();
    },

    /**
     * Verify panel for a given step type
     */
    async verifyPanelForStepType(stepType: string) {
      switch (stepType) {
        case 'welcome':
          await this.verifyWelcomePanel();
          break;
        case 'question':
          await this.verifyQuestionPanel();
          break;
        case 'rating':
          await this.verifyRatingPanel();
          break;
        case 'consent':
          await this.verifyConsentPanel();
          break;
        case 'contact_info':
          await this.verifyContactInfoPanel();
          break;
        case 'reward':
          await this.verifyRewardPanel();
          break;
        case 'thank_you':
          await this.verifyThankYouPanel();
          break;
        default:
          throw new Error(`Unknown step type: ${stepType}`);
      }
    },

    /**
     * Select a step and verify the full panel content
     */
    async selectAndVerifyFullPanel(step: TestStep) {
      await studio.selectStepById(step.id);
      await studio.waitForScrollSettle();
      await this.verifyPanelForStepType(step.stepType);
    },
  };
}
