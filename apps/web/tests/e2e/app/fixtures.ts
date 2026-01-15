/**
 * Playwright Test Fixtures
 *
 * Provides reusable test fixtures for authentication and test data setup.
 * Part of the FSD architecture for E2E tests.
 *
 * @example
 * ```ts
 * import { test, expect } from '../app/fixtures';
 *
 * test('my test', async ({ authedPage, orgSlug, testFormFast }) => {
 *   await authedPage.goto(testFormFast.studioUrl);
 * });
 * ```
 */
import { test as base, Page } from '@playwright/test';
import { authTestIds } from '../../../src/shared/constants/testIds';
import { createFormCreationPage } from '../shared';
import { createTestForm, deleteTestForm } from '../entities';
import type { TestFormData } from '../entities';

// E2E test user credentials - use environment variables in CI
const E2E_USER = {
  email: process.env.E2E_USER_EMAIL || 'testimonials-ms-e2e-tests@brownforge.com',
  password: process.env.E2E_USER_PASSWORD || 'Kh5x%8-Q6-qpU+D',
};

export interface TestFixtures {
  /** Authenticated page with logged-in user */
  authedPage: Page;
  /** Organization slug extracted from authenticated page URL */
  orgSlug: string;
  /** Creates a test form via UI with AI generation, cleans up after test */
  testForm: TestFormData;
  /** Creates a test form via E2E API (fast), cleans up after test */
  testFormFast: TestFormData;
}

/**
 * Extract organization slug from dashboard URL
 * URL format: /{org-slug}/dashboard or /{org-slug}/forms/...
 */
function extractOrgSlug(url: string): string {
  const match = url.match(/\/([^/]+)\/(dashboard|forms|testimonials|widgets|settings)/);
  return match?.[1] || '';
}

export const test = base.extend<TestFixtures>({
  // Authenticated page fixture
  authedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/auth/login');

    // Wait for login form to be visible
    await page.getByTestId(authTestIds.loginForm).waitFor({ timeout: 10000 });

    // Fill login form using test IDs
    await page.getByTestId(authTestIds.loginEmailInput).fill(E2E_USER.email);
    await page.getByTestId(authTestIds.loginPasswordInput).fill(E2E_USER.password);

    // Submit and wait for redirect (longer timeout for slow auth)
    await page.getByTestId(authTestIds.loginSubmitButton).click();
    await page.waitForURL(/dashboard|forms|home/, { timeout: 60000 });

    await use(page);
  },

  // Organization slug fixture - extracted from authenticated page URL
  orgSlug: async ({ authedPage }, use) => {
    const orgSlug = extractOrgSlug(authedPage.url());
    if (!orgSlug) {
      throw new Error('Could not extract organization slug from URL');
    }
    await use(orgSlug);
  },

  // Test form fixture - creates form via UI, cleans up after
  testForm: async ({ authedPage, orgSlug }, use) => {
    const formCreation = createFormCreationPage(authedPage);
    const formName = `E2E Test ${Date.now()}`;

    // Create form via UI
    const { studioUrl, formId } = await formCreation.createForm({
      orgSlug,
      name: formName,
      description: 'A test form for E2E testing',
      category: 'Product',
    });

    const testFormData: TestFormData = {
      id: formId,
      name: formName,
      studioUrl,
      orgSlug,
    };

    // Provide the form to the test
    await use(testFormData);

    // Cleanup: delete the form after test completes
    try {
      await deleteTestForm(formId);
    } catch (error) {
      console.warn(`Failed to cleanup test form ${formId}:`, error);
    }
  },

  // Fast test form fixture - creates form via E2E API (no AI generation)
  // API uses pre-configured E2E_USER_ID and E2E_ORGANIZATION_ID
  testFormFast: async ({ orgSlug }, use) => {
    // Create form via E2E API - no org lookup needed
    const testFormData = await createTestForm(orgSlug);

    // Provide the form to the test
    await use(testFormData);

    // Cleanup: delete the form via E2E API after test completes
    try {
      await deleteTestForm(testFormData.id);
    } catch (error) {
      console.warn(`Failed to cleanup fast test form ${testFormData.id}:`, error);
    }
  },
});

export { expect } from '@playwright/test';
