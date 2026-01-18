/**
 * Auto-Save Focused Tests - Thank You Step
 *
 * Validates auto-save triggers when editing Thank You step fields.
 * Test flow: edit field → close panel → reload → verify persistence.
 *
 * Fields tested:
 * - Title (input) - debounced auto-save
 * - Message (textarea) - debounced auto-save
 * - Redirect URL (input) - debounced auto-save
 *
 * Note: Social Sharing is excluded from auto-save tests per requirements.
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
import { studioTestIds } from '@/shared/constants/testIds';

test.describe('Auto-Save - Thank You Step', { tag: '@autosave' }, () => {
  /**
   * Test: Title auto-saves correctly
   */
  test('title auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Thank You step in the testimonial flow
    const thankYouStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'thank_you')!;

    // Edit the Thank You step
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Fill in new title
    const newTitle = `Thank You Title ${Date.now()}`;
    await actions.autoSave.fillThankYouField('title', newTitle);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the title persisted
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Verify the Title field contains the new value
    const titleInput = studio.page.getByTestId(studioTestIds.thankYouTitleInput);
    await expect(titleInput).toHaveValue(newTitle);
  });

  /**
   * Test: Message auto-saves correctly
   */
  test('message auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Thank You step
    const thankYouStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'thank_you')!;

    // Edit the Thank You step
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Fill in new message
    const newMessage = `Thank You Message ${Date.now()}`;
    await actions.autoSave.fillThankYouField('message', newMessage);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the message persisted
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Verify the Message field contains the new value
    const messageInput = studio.page.getByTestId(studioTestIds.thankYouMessageInput);
    await expect(messageInput).toHaveValue(newMessage);
  });

  /**
   * Test: Redirect URL auto-saves correctly
   */
  test('redirect url auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Thank You step
    const thankYouStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'thank_you')!;

    // Edit the Thank You step
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Fill in new redirect URL
    const newRedirectUrl = `https://example.com/${Date.now()}`;
    await actions.autoSave.fillThankYouField('redirectUrl', newRedirectUrl);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the redirect URL persisted
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Verify the Redirect URL field contains the new value
    const redirectUrlInput = studio.page.getByTestId(studioTestIds.thankYouRedirectUrlInput);
    await expect(redirectUrlInput).toHaveValue(newRedirectUrl);
  });

  /**
   * MVP: Combined test for all Thank You step fields.
   * Tests Title, Message, and Redirect URL in one session.
   * In the future, these should be split into individual atomic tests.
   */
  test('all fields auto-save correctly', { tag: '@smoke' }, async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Thank You step
    const thankYouStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'thank_you')!;

    // Edit the Thank You step
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Fill all fields
    const newTitle = `All TY Title ${Date.now()}`;
    const newMessage = `All TY Message ${Date.now()}`;
    const newRedirectUrl = `https://example.com/all/${Date.now()}`;

    await actions.autoSave.fillThankYouField('title', newTitle);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillThankYouField('message', newMessage);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillThankYouField('redirectUrl', newRedirectUrl);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify all fields
    await actions.select.selectStep(thankYouStep.id);
    await actions.manage.editStep(thankYouStep.id);

    // Verify Title
    const titleInput = studio.page.getByTestId(studioTestIds.thankYouTitleInput);
    await expect(titleInput).toHaveValue(newTitle);

    // Verify Message
    const messageInput = studio.page.getByTestId(studioTestIds.thankYouMessageInput);
    await expect(messageInput).toHaveValue(newMessage);

    // Verify Redirect URL
    const redirectUrlInput = studio.page.getByTestId(studioTestIds.thankYouRedirectUrlInput);
    await expect(redirectUrlInput).toHaveValue(newRedirectUrl);
  });
});
