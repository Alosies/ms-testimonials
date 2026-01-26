/**
 * Auto-Save Focused Tests - Testimonial Write Step
 *
 * Validates auto-save triggers when editing Testimonial Write step fields.
 * Test flow: edit field → close panel → reload → verify persistence.
 *
 * Fields tested:
 * - Title (input) - debounced auto-save
 * - Subtitle (textarea) - debounced auto-save
 * - Placeholder (input) - debounced auto-save
 * - Enable AI Path toggle (switch) - immediate save
 * - Show Previous Answers toggle (switch) - immediate save
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
import { studioTestIds } from '@/shared/constants/testIds';

test.describe('Auto-Save - Testimonial Write Step', { tag: '@autosave' }, () => {
  /**
   * Test: Title auto-saves correctly
   */
  test('title auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Testimonial Write step in the testimonial flow
    const testimonialWriteStep = branchedFormViaApi.testimonialFlow.steps.find(
      s => s.stepType === 'testimonial_write'
    )!;

    // Edit the Testimonial Write step
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Fill in new title
    const newTitle = `Testimonial Title ${Date.now()}`;
    await actions.autoSave.fillTestimonialWriteField('title', newTitle);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the title persisted
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Verify the Title field contains the new value
    const titleInput = studio.page.getByTestId(studioTestIds.testimonialWriteTitleInput);
    await expect(titleInput).toHaveValue(newTitle);
  });

  /**
   * Test: Subtitle auto-saves correctly
   */
  test('subtitle auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Testimonial Write step
    const testimonialWriteStep = branchedFormViaApi.testimonialFlow.steps.find(
      s => s.stepType === 'testimonial_write'
    )!;

    // Edit the Testimonial Write step
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Fill in new subtitle
    const newSubtitle = `Testimonial Subtitle ${Date.now()}`;
    await actions.autoSave.fillTestimonialWriteField('subtitle', newSubtitle);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the subtitle persisted
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Verify the Subtitle field contains the new value
    const subtitleInput = studio.page.getByTestId(studioTestIds.testimonialWriteSubtitleInput);
    await expect(subtitleInput).toHaveValue(newSubtitle);
  });

  /**
   * Test: Placeholder auto-saves correctly
   */
  test('placeholder auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Testimonial Write step
    const testimonialWriteStep = branchedFormViaApi.testimonialFlow.steps.find(
      s => s.stepType === 'testimonial_write'
    )!;

    // Edit the Testimonial Write step
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Fill in new placeholder
    const newPlaceholder = `Custom placeholder text ${Date.now()}`;
    await actions.autoSave.fillTestimonialWriteField('placeholder', newPlaceholder);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the placeholder persisted
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Verify the Placeholder field contains the new value
    const placeholderInput = studio.page.getByTestId(studioTestIds.testimonialWritePlaceholderInput);
    await expect(placeholderInput).toHaveValue(newPlaceholder);
  });

  /**
   * Test: Enable AI Path toggle auto-saves correctly
   * Note: Uses immediate save (ADR-011), not debounced auto-save
   */
  test('enable AI path toggle auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Testimonial Write step
    const testimonialWriteStep = branchedFormViaApi.testimonialFlow.steps.find(
      s => s.stepType === 'testimonial_write'
    )!;

    // Edit the Testimonial Write step
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Get the current state and toggle it
    const initialState = await actions.autoSave.getTestimonialWriteEnableAiPathState();
    await actions.autoSave.toggleTestimonialWriteEnableAiPath();

    // Close editor and wait for save (immediate save for toggle)
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the toggle persisted
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Verify the Enable AI Path toggle changed
    const newState = await actions.autoSave.getTestimonialWriteEnableAiPathState();
    expect(newState).toBe(!initialState);
  });

  /**
   * Test: Show Previous Answers toggle auto-saves correctly
   * Note: Uses immediate save (ADR-011), not debounced auto-save
   */
  test('show previous answers toggle auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Testimonial Write step
    const testimonialWriteStep = branchedFormViaApi.testimonialFlow.steps.find(
      s => s.stepType === 'testimonial_write'
    )!;

    // Edit the Testimonial Write step
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Get the current state and toggle it
    const initialState = await actions.autoSave.getTestimonialWriteShowPrevAnswersState();
    await actions.autoSave.toggleTestimonialWriteShowPrevAnswers();

    // Close editor and wait for save (immediate save for toggle)
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the toggle persisted
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Verify the Show Previous Answers toggle changed
    const newState = await actions.autoSave.getTestimonialWriteShowPrevAnswersState();
    expect(newState).toBe(!initialState);
  });

  /**
   * MVP: Combined test for all Testimonial Write step fields.
   * Tests Title, Subtitle, Placeholder, and toggles in one session.
   * In the future, these should be split into individual atomic tests.
   */
  test('all fields auto-save correctly', { tag: '@smoke' }, async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Testimonial Write step
    const testimonialWriteStep = branchedFormViaApi.testimonialFlow.steps.find(
      s => s.stepType === 'testimonial_write'
    )!;

    // Edit the Testimonial Write step
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Get initial toggle states
    const initialEnableAiPathState = await actions.autoSave.getTestimonialWriteEnableAiPathState();
    const initialShowPrevAnswersState = await actions.autoSave.getTestimonialWriteShowPrevAnswersState();

    // Fill all text fields
    const newTitle = `All Testimonial Title ${Date.now()}`;
    const newSubtitle = `All Testimonial Subtitle ${Date.now()}`;
    const newPlaceholder = `All Placeholder ${Date.now()}`;

    await actions.autoSave.fillTestimonialWriteField('title', newTitle);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillTestimonialWriteField('subtitle', newSubtitle);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillTestimonialWriteField('placeholder', newPlaceholder);
    await studio.page.waitForTimeout(500);

    // Toggle both switches
    await actions.autoSave.toggleTestimonialWriteEnableAiPath();
    await studio.page.waitForTimeout(500);
    await actions.autoSave.toggleTestimonialWriteShowPrevAnswers();

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify all fields
    await actions.select.selectStep(testimonialWriteStep.id);
    await actions.manage.editStep(testimonialWriteStep.id);

    // Verify Title
    const titleInput = studio.page.getByTestId(studioTestIds.testimonialWriteTitleInput);
    await expect(titleInput).toHaveValue(newTitle);

    // Verify Subtitle
    const subtitleInput = studio.page.getByTestId(studioTestIds.testimonialWriteSubtitleInput);
    await expect(subtitleInput).toHaveValue(newSubtitle);

    // Verify Placeholder
    const placeholderInput = studio.page.getByTestId(studioTestIds.testimonialWritePlaceholderInput);
    await expect(placeholderInput).toHaveValue(newPlaceholder);

    // Verify Enable AI Path toggle changed
    const newEnableAiPathState = await actions.autoSave.getTestimonialWriteEnableAiPathState();
    expect(newEnableAiPathState).toBe(!initialEnableAiPathState);

    // Verify Show Previous Answers toggle changed
    const newShowPrevAnswersState = await actions.autoSave.getTestimonialWriteShowPrevAnswersState();
    expect(newShowPrevAnswersState).toBe(!initialShowPrevAnswersState);
  });
});
