/**
 * Auto-Save Focused Tests - Question Step
 *
 * Validates auto-save triggers when editing Question step fields.
 * Test flow: edit field → close panel → reload → verify persistence.
 *
 * Fields tested:
 * - Question Text (text area)
 * - Required toggle (switch) - uses immediate save, not debounced auto-save
 * - Placeholder Text (input)
 * - Help Text (input)
 *
 * Note: Step Type and Question Type are excluded from auto-save tests.
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test.describe('Auto-Save - Question Step', { tag: '@autosave' }, () => {
  /**
   * Test: Question Text auto-saves correctly
   */
  test('question text auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;
    const stepCard = studio.getCanvasStepCard(questionStep.id);

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Fill in new question text
    const newQuestionText = `Question Text ${Date.now()}`;
    await actions.autoSave.fillQuestionTextField('questionText', newQuestionText);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Wait for step card to be visible, then verify question text via heading
    const questionHeading = stepCard.locator('h3');
    await questionHeading.waitFor({ state: 'visible', timeout: 10000 });
    await expect(questionHeading).toContainText(newQuestionText);
  });

  /**
   * Test: Required toggle auto-saves correctly
   * Note: Uses immediate save (ADR-011), not debounced auto-save
   */
  test('required toggle auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Get the current state and toggle it
    const initialState = await actions.autoSave.getRequiredState();
    await actions.autoSave.toggleRequired();

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the toggle persisted
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Verify the Required toggle changed
    const newState = await actions.autoSave.getRequiredState();
    expect(newState).toBe(!initialState);
  });

  /**
   * Test: Placeholder Text auto-saves correctly
   */
  test('placeholder text auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Fill in new placeholder text
    const newPlaceholder = `Placeholder ${Date.now()}`;
    await actions.autoSave.fillQuestionTextField('placeholder', newPlaceholder);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the placeholder persisted
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Verify the Placeholder field contains the new value
    const placeholderInput = studio.page.locator('#placeholder');
    await expect(placeholderInput).toHaveValue(newPlaceholder);
  });

  /**
   * Test: Help Text auto-saves correctly
   */
  test('help text auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Fill in new help text
    const newHelpText = `Help Text ${Date.now()}`;
    await actions.autoSave.fillQuestionTextField('helpText', newHelpText);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the help text persisted
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Verify the Help Text field contains the new value
    const helpTextInput = studio.page.locator('#helpText');
    await expect(helpTextInput).toHaveValue(newHelpText);
  });

  /**
   * Combined test: All Question step text fields auto-save correctly
   * Tests Question Text, Required, Placeholder, and Help Text in one session.
   *
   * Note: Question Type is excluded due to database constraint issues.
   */
  test('all text fields auto-save correctly', { tag: '@smoke' }, async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'question')!;
    const stepCard = studio.getCanvasStepCard(questionStep.id);

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Get initial Required state
    const initialRequiredState = await actions.autoSave.getRequiredState();

    // Fill all text fields and toggle Required
    // Add small delays between fields to allow auto-save debounce to process
    const newQuestionText = `All Fields Question ${Date.now()}`;
    const newPlaceholder = `All Fields Placeholder ${Date.now()}`;
    const newHelpText = `All Fields Help ${Date.now()}`;

    await actions.autoSave.fillQuestionTextField('questionText', newQuestionText);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.toggleRequired();
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillQuestionTextField('placeholder', newPlaceholder);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillQuestionTextField('helpText', newHelpText);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Wait for step card and verify Question Text via heading
    const questionHeading = stepCard.locator('h3');
    await questionHeading.waitFor({ state: 'visible', timeout: 10000 });
    await expect(questionHeading).toContainText(newQuestionText);

    // Re-open editor to verify other fields
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Verify Required toggle changed
    const newRequiredState = await actions.autoSave.getRequiredState();
    expect(newRequiredState).toBe(!initialRequiredState);

    // Verify Placeholder
    const placeholderInput = studio.page.locator('#placeholder');
    await expect(placeholderInput).toHaveValue(newPlaceholder);

    // Verify Help Text
    const helpTextInput = studio.page.locator('#helpText');
    await expect(helpTextInput).toHaveValue(newHelpText);
  });
});
