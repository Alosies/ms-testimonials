/**
 * Auto-Save Focused Tests - Consent Step
 *
 * Validates auto-save triggers when editing Consent step fields.
 * Test flow: edit field → close panel → reload → verify persistence.
 *
 * Fields tested:
 * - Title (input) - debounced auto-save
 * - Description (textarea) - debounced auto-save
 * - Public Option Label (input) - debounced auto-save
 * - Public Option Description (input) - debounced auto-save
 * - Private Option Label (input) - debounced auto-save
 * - Private Option Description (input) - debounced auto-save
 * - Required toggle (switch) - immediate save
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';
import { studioTestIds } from '@/shared/constants/testIds';

test.describe('Auto-Save - Consent Step', { tag: '@autosave' }, () => {
  /**
   * Test: Title auto-saves correctly
   */
  test('title auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Consent step in the testimonial flow
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent')!;

    // Edit the Consent step
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Fill in new title
    const newTitle = `Consent Title ${Date.now()}`;
    await actions.autoSave.fillConsentField('title', newTitle);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the title persisted
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Verify the Title field contains the new value
    const titleInput = studio.page.getByTestId(studioTestIds.consentTitleInput);
    await expect(titleInput).toHaveValue(newTitle);
  });

  /**
   * Test: Description auto-saves correctly
   */
  test('description auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Consent step
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent')!;

    // Edit the Consent step
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Fill in new description
    const newDescription = `Consent Description ${Date.now()}`;
    await actions.autoSave.fillConsentField('description', newDescription);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the description persisted
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Verify the Description field contains the new value
    const descriptionInput = studio.page.getByTestId(studioTestIds.consentDescriptionInput);
    await expect(descriptionInput).toHaveValue(newDescription);
  });

  /**
   * Test: Public Option Label auto-saves correctly
   */
  test('public option label auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Consent step
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent')!;

    // Edit the Consent step
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Fill in new public option label
    const newPublicLabel = `Public Label ${Date.now()}`;
    await actions.autoSave.fillConsentField('publicLabel', newPublicLabel);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the public option label persisted
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Verify the Public Option Label field contains the new value
    const publicLabelInput = studio.page.getByTestId(studioTestIds.consentPublicLabelInput);
    await expect(publicLabelInput).toHaveValue(newPublicLabel);
  });

  /**
   * Test: Private Option Label auto-saves correctly
   */
  test('private option label auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Consent step
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent')!;

    // Edit the Consent step
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Fill in new private option label
    const newPrivateLabel = `Private Label ${Date.now()}`;
    await actions.autoSave.fillConsentField('privateLabel', newPrivateLabel);

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the private option label persisted
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Verify the Private Option Label field contains the new value
    const privateLabelInput = studio.page.getByTestId(studioTestIds.consentPrivateLabelInput);
    await expect(privateLabelInput).toHaveValue(newPrivateLabel);
  });

  /**
   * Test: Required toggle auto-saves correctly
   * Note: Uses immediate save (ADR-011), not debounced auto-save
   */
  test('required toggle auto-saves correctly', async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Consent step
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent')!;

    // Edit the Consent step
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Get the current state and toggle it
    const initialState = await actions.autoSave.getConsentRequiredState();
    await actions.autoSave.toggleConsentRequired();

    // Close editor and wait for save (immediate save for toggle)
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify the toggle persisted
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Verify the Required toggle changed
    const newState = await actions.autoSave.getConsentRequiredState();
    expect(newState).toBe(!initialState);
  });

  /**
   * MVP: Combined test for all Consent step fields.
   * Tests Title, Description, Public/Private Labels and Descriptions, and Required in one session.
   * In the future, these should be split into individual atomic tests.
   */
  test('all fields auto-save correctly', { tag: '@smoke' }, async ({ authedPage, branchedFormViaApi }) => {
    const studio = createStudioPage(authedPage);
    const actions = createStudioActions(studio);

    await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

    // Find the Consent step
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent')!;

    // Edit the Consent step
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Get initial Required state
    const initialRequiredState = await actions.autoSave.getConsentRequiredState();

    // Fill all fields
    const newTitle = `All Consent Title ${Date.now()}`;
    const newDescription = `All Consent Desc ${Date.now()}`;
    const newPublicLabel = `All Public ${Date.now()}`;
    const newPublicDesc = `All Public Desc ${Date.now()}`;
    const newPrivateLabel = `All Private ${Date.now()}`;
    const newPrivateDesc = `All Private Desc ${Date.now()}`;

    await actions.autoSave.fillConsentField('title', newTitle);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillConsentField('description', newDescription);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillConsentField('publicLabel', newPublicLabel);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillConsentField('publicDescription', newPublicDesc);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillConsentField('privateLabel', newPrivateLabel);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.fillConsentField('privateDescription', newPrivateDesc);
    await studio.page.waitForTimeout(500);
    await actions.autoSave.toggleConsentRequired();

    // Close editor and wait for auto-save
    await actions.autoSave.closeEditorAndWaitForSave();

    // Reload and verify persistence
    await studio.page.reload();
    await actions.setup.waitForStudioLoad();

    // Re-open editor to verify all fields
    await actions.select.selectStep(consentStep.id);
    await actions.manage.editStep(consentStep.id);

    // Verify Title
    const titleInput = studio.page.getByTestId(studioTestIds.consentTitleInput);
    await expect(titleInput).toHaveValue(newTitle);

    // Verify Description
    const descriptionInput = studio.page.getByTestId(studioTestIds.consentDescriptionInput);
    await expect(descriptionInput).toHaveValue(newDescription);

    // Verify Required toggle changed
    const newRequiredState = await actions.autoSave.getConsentRequiredState();
    expect(newRequiredState).toBe(!initialRequiredState);

    // Verify Public Option Label
    const publicLabelInput = studio.page.getByTestId(studioTestIds.consentPublicLabelInput);
    await expect(publicLabelInput).toHaveValue(newPublicLabel);

    // Verify Public Option Description
    const publicDescInput = studio.page.getByTestId(studioTestIds.consentPublicDescriptionInput);
    await expect(publicDescInput).toHaveValue(newPublicDesc);

    // Verify Private Option Label
    const privateLabelInput = studio.page.getByTestId(studioTestIds.consentPrivateLabelInput);
    await expect(privateLabelInput).toHaveValue(newPrivateLabel);

    // Verify Private Option Description
    const privateDescInput = studio.page.getByTestId(studioTestIds.consentPrivateDescriptionInput);
    await expect(privateDescInput).toHaveValue(newPrivateDesc);
  });
});
