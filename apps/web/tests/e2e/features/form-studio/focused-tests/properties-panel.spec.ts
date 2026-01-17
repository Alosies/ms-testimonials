/**
 * Properties Panel Focused Tests
 *
 * Focused tests for debugging properties panel issues.
 * Run these when the journey test fails to pinpoint the problem.
 *
 * ## Key Differentiators Tested
 * - Basic panels (Welcome/Consent/ThankYou): no branching
 * - Question panel: standard panel with contextual help
 * - Rating panel: has branching settings (unique)
 * - Panel switching: verifies dynamic updates
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test.describe('Properties Panel - Focused Tests', () => {
  test('basic step panels show correct content (no branching)', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Welcome step - representative of basic panels
    const welcomeStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'welcome')!;
    await actions.select.selectStep(welcomeStep.id);
    await actions.props.verifyWelcomePanel();

    // Thank You step - another basic panel in branch flow
    const thankYouStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'thank_you')!;
    await actions.select.selectStep(thankYouStep.id);
    await actions.props.verifyThankYouPanel();
  });

  test('question step panel shows contextual help', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;
    await actions.select.selectStep(questionStep.id);

    // Question has contextual help but no branching
    await studio.expectPropertiesStepType('Question Step');
    await studio.expectContextualHelpVisible();
    await studio.expectBranchingSettingsHidden();
  });

  test('rating step panel shows branching settings', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;
    await actions.select.selectStep(ratingStep.id);

    // Rating is unique - has branching settings
    await studio.expectPropertiesStepType('Rating Step');
    await studio.expectContextualHelpVisible();
    await studio.expectBranchingSettingsVisible();
  });

  test('panel updates correctly when switching between step types', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    const welcomeStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'welcome')!;
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;

    // Welcome -> no branching
    await actions.select.selectStep(welcomeStep.id);
    await studio.expectPropertiesStepType('Welcome Step');
    await studio.expectBranchingSettingsHidden();

    // Question -> no branching
    await actions.select.selectStep(questionStep.id);
    await studio.expectPropertiesStepType('Question Step');
    await studio.expectBranchingSettingsHidden();

    // Rating -> branching visible
    await actions.select.selectStep(ratingStep.id);
    await studio.expectPropertiesStepType('Rating Step');
    await studio.expectBranchingSettingsVisible();

    // Back to Welcome -> verify state resets
    await actions.select.selectStep(welcomeStep.id);
    await studio.expectPropertiesStepType('Welcome Step');
    await studio.expectBranchingSettingsHidden();
  });
});
