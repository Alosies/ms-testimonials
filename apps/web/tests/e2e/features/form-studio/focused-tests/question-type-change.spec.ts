/**
 * Question Type Change - Focused Tests
 *
 * TDD tests for ADR-017: Question Type Change Workflow
 *
 * Test scenarios:
 * 1. Change type when no responses (happy path)
 * 2. Verify options deleted when changing from choice type
 * 3. Block type change when responses exist
 * 4. Delete responses then change type
 * 5. Preserve common fields after type change
 *
 * @see /docs/adr/017-question-type-change-workflow/adr.md
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test.describe('Question Type Change', { tag: '@question-type-change' }, () => {
  /**
   * SCENARIO 1: Happy Path - Change type when no responses exist
   *
   * Given: A Question step with type "Paragraph"
   * When: User changes type to "Star rating"
   * Then: Type changes successfully and persists after reload
   */
  test('can change question type when no responses exist', async ({
    authedPage,
    branchedFormViaApi,
  }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step (Paragraph type by default)
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(
      (s) => s.stepType === 'question'
    )!;

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Get initial question type
    const initialType = await actions.autoSave.getQuestionType();
    expect(initialType).toBe('Paragraph');

    // Change to Star rating
    await actions.autoSave.selectQuestionType('rating_star');

    // Close editor and wait for save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor and verify type changed
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    const newType = await actions.autoSave.getQuestionType();
    expect(newType).toBe('Star rating');
  });

  /**
   * SCENARIO 2: Warning Dialog - Options will be deleted
   *
   * Given: A Question step with type "Multiple choice" and 3 options
   * When: User changes type to "Paragraph"
   * Then: Warning dialog appears showing "3 options will be deleted"
   * And: After confirmation, type changes and options are removed
   */
  test('shows warning when changing from choice type with options', async ({
    authedPage,
    choiceQuestionFormViaApi, // New fixture needed with choice question + options
  }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(choiceQuestionFormViaApi.studioUrl);

    // Find the choice question step
    const choiceStep = choiceQuestionFormViaApi.sharedFlow.steps.find(
      (s) => s.stepType === 'question' && s.question?.questionType === 'choice_single'
    )!;

    // Edit the choice question
    await actions.select.selectStep(choiceStep.id);
    await actions.manage.editStep(choiceStep.id);

    // Verify options exist
    const optionCount = await actions.questionType.getOptionCount();
    expect(optionCount).toBeGreaterThan(0);

    // Try to change to Paragraph
    await actions.questionType.selectTypeWithWarning('text_long');

    // Verify warning dialog appears
    await actions.questionType.expectWarningDialogVisible();
    await actions.questionType.expectWarningMessage(`${optionCount} options`);

    // Confirm the change
    await actions.questionType.confirmTypeChange();

    // Wait for save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify options are gone
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    await actions.select.selectStep(choiceStep.id);
    await actions.manage.editStep(choiceStep.id);

    // Should not show options section anymore
    await actions.questionType.expectOptionsHidden();
  });

  /**
   * SCENARIO 3: Blocked - Cannot change type when responses exist
   *
   * Given: A Question step that has form responses
   * When: User tries to open the question type dropdown
   * Then: Dropdown is disabled
   * And: Message shows "Cannot change type: X responses exist"
   * And: "Delete responses" button is visible
   */
  test('blocks type change when responses exist', async ({
    authedPage,
    formWithResponsesViaApi, // New fixture needed with actual responses
  }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(formWithResponsesViaApi.studioUrl);

    // Find a question step that has responses
    const questionWithResponses = formWithResponsesViaApi.sharedFlow.steps.find(
      (s) => s.stepType === 'question' && (s.question?.responseCount ?? 0 > 0)
    )!;

    // Edit the question
    await actions.select.selectStep(questionWithResponses.id);
    await actions.manage.editStep(questionWithResponses.id);

    // Verify dropdown is disabled
    await actions.questionType.expectTypeDropdownDisabled();

    // Verify warning message is shown
    const responseCount = questionWithResponses.question!.responseCount ?? 0;
    await actions.questionType.expectResponsesBlockMessage(responseCount);

    // Verify "Delete responses" button is visible
    await actions.questionType.expectDeleteResponsesButtonVisible();
  });

  /**
   * SCENARIO 4: Delete responses then change type
   *
   * Given: A Question step with 5 responses
   * When: User clicks "Delete responses" and confirms
   * Then: Dropdown becomes enabled
   * And: User can change the type
   */
  test('can delete responses to enable type change', async ({
    authedPage,
    formWithResponsesViaApi,
  }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(formWithResponsesViaApi.studioUrl);

    // Find a question step that has responses
    const questionWithResponses = formWithResponsesViaApi.sharedFlow.steps.find(
      (s) => s.stepType === 'question' && (s.question?.responseCount ?? 0 > 0)
    )!;

    // Edit the question
    await actions.select.selectStep(questionWithResponses.id);
    await actions.manage.editStep(questionWithResponses.id);

    // Click "Delete responses" button
    await actions.questionType.clickDeleteResponses();

    // Verify confirmation dialog appears
    await actions.questionType.expectDeleteResponsesDialogVisible();

    // Confirm deletion
    await actions.questionType.confirmDeleteResponses();

    // Wait for deletion to complete
    await studio.page.waitForTimeout(1000);

    // Verify dropdown is now enabled
    await actions.questionType.expectTypeDropdownEnabled();

    // Change the type
    await actions.autoSave.selectQuestionType('rating_star');

    // Close and verify persistence
    await actions.autoSave.closeEditorAndWaitForSave();
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    await actions.select.selectStep(questionWithResponses.id);
    await actions.manage.editStep(questionWithResponses.id);

    const newType = await actions.autoSave.getQuestionType();
    expect(newType).toBe('Star rating');
  });

  /**
   * SCENARIO 5: Common fields preserved after type change
   *
   * Given: A Question step with custom question text, help text, and placeholder
   * When: User changes type from Paragraph to Short answer
   * Then: Question text, help text, is_required are preserved
   */
  test('preserves common fields after type change', async ({
    authedPage,
    branchedFormViaApi,
  }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find a Question step
    const questionStep = branchedFormViaApi.sharedFlow.steps.find(
      (s) => s.stepType === 'question'
    )!;

    // Edit the Question step
    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Set custom values for common fields
    const customQuestionText = `Custom Question ${Date.now()}`;
    const customHelpText = `Custom Help ${Date.now()}`;

    await actions.autoSave.fillQuestionTextField('questionText', customQuestionText);
    await actions.autoSave.fillQuestionTextField('helpText', customHelpText);
    await actions.autoSave.toggleRequired(); // Toggle to opposite of current

    // Wait for auto-save
    await studio.page.waitForTimeout(1000);

    // Get current required state
    const requiredBefore = await actions.autoSave.getRequiredState();

    // Change to Short answer
    await actions.autoSave.selectQuestionType('text_short');

    // Close and wait for save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    await actions.select.selectStep(questionStep.id);
    await actions.manage.editStep(questionStep.id);

    // Verify common fields preserved
    const questionTextInput = studio.page.locator('#questionText');
    await expect(questionTextInput).toHaveValue(customQuestionText);

    const helpTextInput = studio.page.locator('#helpText');
    await expect(helpTextInput).toHaveValue(customHelpText);

    const requiredAfter = await actions.autoSave.getRequiredState();
    expect(requiredAfter).toBe(requiredBefore);

    // Verify type changed
    const newType = await actions.autoSave.getQuestionType();
    expect(newType).toBe('Short answer');
  });

  /**
   * SCENARIO 6: Cancel warning dialog
   *
   * Given: A Question step with options
   * When: User tries to change type and sees warning
   * And: User clicks Cancel
   * Then: Type remains unchanged
   *
   * TODO: This test requires choice_single type which is only in Pro/Team plans.
   * The E2E test organization currently has Free plan which doesn't include choice_single.
   * Need to upgrade E2E org plan to Pro or Team to enable this test.
   */
  test.skip('can cancel type change from warning dialog', async ({
    authedPage,
    choiceQuestionFormViaApi,
  }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(choiceQuestionFormViaApi.studioUrl);

    // Find the choice question step
    const choiceStep = choiceQuestionFormViaApi.sharedFlow.steps.find(
      (s) => s.stepType === 'question' && s.question?.questionType === 'choice_single'
    )!;

    // Edit the choice question
    await actions.select.selectStep(choiceStep.id);
    await actions.manage.editStep(choiceStep.id);

    // Wait for organization data to load (question types dropdown)
    await actions.questionType.waitForTypeDropdownLoaded();

    // Verify initial type is Single choice (choice_single type display name)
    const initialType = await actions.autoSave.getQuestionType();
    expect(initialType).toBe('Single choice');

    // Try to change to Paragraph
    await actions.questionType.selectTypeWithWarning('text_long');

    // Verify warning dialog appears
    await actions.questionType.expectWarningDialogVisible();

    // Click Cancel
    await actions.questionType.cancelTypeChange();

    // Verify dialog closed
    await actions.questionType.expectWarningDialogHidden();

    // Wait for UI to settle after dialog close
    await studio.page.waitForTimeout(500);

    // Verify type unchanged
    const currentType = await actions.autoSave.getQuestionType();
    expect(currentType).toBe('Single choice');

    // Verify options still exist
    const optionCount = await actions.questionType.getOptionCount();
    expect(optionCount).toBeGreaterThan(0);
  });
});
