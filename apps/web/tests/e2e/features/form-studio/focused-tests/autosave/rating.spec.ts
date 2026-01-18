/**
 * Auto-Save Focused Tests - Rating Step
 *
 * Validates auto-save triggers when editing Rating step fields.
 * Test flow: edit field → close panel → reload → verify persistence.
 *
 * Fields tested:
 * - Rating Question (textarea) - debounced auto-save
 * - Low Label (input) - debounced auto-save
 * - High Label (input) - debounced auto-save
 * - Help Text (input) - debounced auto-save
 * - Required toggle (switch) - uses immediate save, not debounced auto-save
 *
 * Note: Conditional Branching is excluded from auto-save tests per requirements.
 * Note: Start Value and End Value use immediate save via setValidation.
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
import { studioTestIds } from '@/shared/constants/testIds';

test.describe('Auto-Save - Rating Step', { tag: '@autosave' }, () => {
  /**
   * Test: Rating Question auto-saves correctly
   */
  test('rating question auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Rating step in the shared flow
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;
    const stepCard = studio.getCanvasStepCard(ratingStep.id);

    // Edit the Rating step
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Fill in new rating question
    const newRatingQuestion = `Rating Question ${Date.now()}`;
    await actions.autoSave.fillRatingTextField('ratingQuestion', newRatingQuestion);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Verify rating question via heading in step card
    const questionHeading = stepCard.locator('h3');
    await questionHeading.waitFor({ state: 'visible', timeout: 10000 });
    await expect(questionHeading).toContainText(newRatingQuestion);
  });

  /**
   * Test: Low Label auto-saves correctly
   */
  test('low label auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Rating step
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;

    // Edit the Rating step
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Fill in new low label
    const newLowLabel = `Low ${Date.now()}`;
    await actions.autoSave.fillRatingTextField('lowLabel', newLowLabel);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the low label persisted
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Find the Low Label input and verify value
    const lowLabelInput = studio.page.getByTestId(studioTestIds.ratingLowLabelInput);
    await expect(lowLabelInput).toHaveValue(newLowLabel);
  });

  /**
   * Test: High Label auto-saves correctly
   */
  test('high label auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Rating step
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;

    // Edit the Rating step
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Fill in new high label
    const newHighLabel = `High ${Date.now()}`;
    await actions.autoSave.fillRatingTextField('highLabel', newHighLabel);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the high label persisted
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Find the High Label input and verify value
    const highLabelInput = studio.page.getByTestId(studioTestIds.ratingHighLabelInput);
    await expect(highLabelInput).toHaveValue(newHighLabel);
  });

  /**
   * Test: Help Text auto-saves correctly
   */
  test('help text auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Rating step
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;

    // Edit the Rating step
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Fill in new help text
    const newHelpText = `Help Text ${Date.now()}`;
    await actions.autoSave.fillRatingTextField('helpText', newHelpText);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the help text persisted
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Find the Help Text input and verify value
    const helpTextInput = studio.page.getByTestId(studioTestIds.ratingHelpTextInput);
    await expect(helpTextInput).toHaveValue(newHelpText);
  });

  /**
   * Test: Required toggle auto-saves correctly
   * Note: Uses immediate save (ADR-011), not debounced auto-save
   */
  test('required toggle auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Rating step
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;

    // Edit the Rating step
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Get the current state and toggle it
    const initialState = await actions.autoSave.getRatingRequiredState();
    await actions.autoSave.toggleRatingRequired();

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the toggle persisted
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Verify the Required toggle changed
    const newState = await actions.autoSave.getRatingRequiredState();
    expect(newState).toBe(!initialState);
  });

  /**
   * MVP: Combined test for all Rating step text fields.
   * Tests Rating Question, Low Label, High Label, Help Text, and Required in one session.
   * In the future, these should be split into individual atomic tests.
   */
  test('all fields auto-save correctly', { tag: '@smoke' }, async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Rating step
    const ratingStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'rating')!;
    const stepCard = studio.getCanvasStepCard(ratingStep.id);

    // Edit the Rating step
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Get initial Required state
    const initialRequiredState = await actions.autoSave.getRatingRequiredState();

    // Fill all text fields and toggle Required
    const newRatingQuestion = `All Fields Rating ${Date.now()}`;
    const newLowLabel = `All Low ${Date.now()}`;
    const newHighLabel = `All High ${Date.now()}`;
    const newHelpText = `All Help ${Date.now()}`;

    // Fill all text fields - auto-save batches changes and saves on close
    await actions.autoSave.fillRatingTextField('ratingQuestion', newRatingQuestion);
    await actions.autoSave.fillRatingTextField('lowLabel', newLowLabel);
    await actions.autoSave.fillRatingTextField('highLabel', newHighLabel);
    await actions.autoSave.fillRatingTextField('helpText', newHelpText);
    await actions.autoSave.toggleRatingRequired();

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Verify Rating Question via heading in step card
    const questionHeading = stepCard.locator('h3');
    await questionHeading.waitFor({ state: 'visible', timeout: 10000 });
    await expect(questionHeading).toContainText(newRatingQuestion);

    // Re-open editor to verify other fields
    await actions.select.selectStep(ratingStep.id);
    await actions.manage.editStep(ratingStep.id);

    // Verify Required toggle changed
    const newRequiredState = await actions.autoSave.getRatingRequiredState();
    expect(newRequiredState).toBe(!initialRequiredState);

    // Verify Low Label
    const lowLabelInput = studio.page.getByTestId(studioTestIds.ratingLowLabelInput);
    await expect(lowLabelInput).toHaveValue(newLowLabel);

    // Verify High Label
    const highLabelInput = studio.page.getByTestId(studioTestIds.ratingHighLabelInput);
    await expect(highLabelInput).toHaveValue(newHighLabel);

    // Verify Help Text
    const helpTextInput = studio.page.getByTestId(studioTestIds.ratingHelpTextInput);
    await expect(helpTextInput).toHaveValue(newHelpText);
  });
});
