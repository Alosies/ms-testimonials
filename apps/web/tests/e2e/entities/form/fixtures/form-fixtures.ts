/**
 * Form Playwright Fixtures
 *
 * Provides test fixtures for creating and cleaning up test forms.
 * These fixtures extend the base app fixtures with form-specific setup.
 *
 * @example
 * ```ts
 * import { test, expect } from '../entities/form/fixtures';
 *
 * test('form studio test', async ({ authedPage, formViaApi }) => {
 *   await authedPage.goto(formViaApi.studioUrl);
 * });
 * ```
 */
import { test as appTest } from '../../../app/fixtures';
import { createFormCreationPage } from '../../../shared';
import { createTestForm, createTestBranchedForm, createTestChoiceQuestionForm, createTestFormWithResponses, deleteTestForm } from './form-api';
import type { TestFormData, TestBranchedFormData, TestChoiceQuestionFormData, TestFormWithResponsesData } from '../types';

export interface FormFixtures {
  /** Form created via E2E API (fast, ~1s) - use for most tests */
  formViaApi: TestFormData;
  /** Form created via UI with AI generation (slow, ~30s) - use for UI flow tests */
  formViaUi: TestFormData;
  /** Branched form via E2E API (fast) - use for branch navigation tests */
  branchedFormViaApi: TestBranchedFormData;
  /** Form with choice_single question and options via E2E API (fast) - use for question type change tests */
  choiceQuestionFormViaApi: TestChoiceQuestionFormData;
  /** Form with mock responses via E2E API (fast) - use for response-dependent tests */
  formWithResponsesViaApi: TestFormWithResponsesData;
}

export const test = appTest.extend<FormFixtures>({
  // Form via API (fast) - use for most tests
  formViaApi: async ({ orgSlug }, use) => {
    const formData = await createTestForm(orgSlug);

    await use(formData);

    // Cleanup after test
    try {
      await deleteTestForm(formData.id);
    } catch (error) {
      console.warn(`Failed to cleanup form ${formData.id}:`, error);
    }
  },

  // Form via UI (slow) - use for UI flow tests with AI generation
  formViaUi: async ({ authedPage, orgSlug }, use) => {
    const formCreation = createFormCreationPage(authedPage);
    const formName = `E2E Test ${Date.now()}`;

    const { studioUrl, formId } = await formCreation.createForm({
      orgSlug,
      name: formName,
      description: 'A test form for E2E testing',
      category: 'Product',
    });

    const formData: TestFormData = {
      id: formId,
      name: formName,
      studioUrl,
      orgSlug,
    };

    await use(formData);

    // Cleanup after test
    try {
      await deleteTestForm(formId);
    } catch (error) {
      console.warn(`Failed to cleanup form ${formId}:`, error);
    }
  },

  // Branched form via API (fast) - use for branch navigation tests
  branchedFormViaApi: async ({ orgSlug }, use) => {
    const formData = await createTestBranchedForm(orgSlug);

    await use(formData);

    // Cleanup after test
    try {
      await deleteTestForm(formData.id);
    } catch (error) {
      console.warn(`Failed to cleanup branched form ${formData.id}:`, error);
    }
  },

  // Choice question form via API (fast) - use for question type change tests
  choiceQuestionFormViaApi: async ({ orgSlug }, use) => {
    const formData = await createTestChoiceQuestionForm(orgSlug);

    await use(formData);

    // Cleanup after test
    try {
      await deleteTestForm(formData.id);
    } catch (error) {
      console.warn(`Failed to cleanup choice question form ${formData.id}:`, error);
    }
  },

  // Form with responses via API (fast) - use for response-dependent tests
  formWithResponsesViaApi: async ({ orgSlug }, use) => {
    const formData = await createTestFormWithResponses(orgSlug);

    await use(formData);

    // Cleanup after test
    try {
      await deleteTestForm(formData.id);
    } catch (error) {
      console.warn(`Failed to cleanup form with responses ${formData.id}:`, error);
    }
  },
});

export { expect } from '@playwright/test';
