/**
 * App-Level Playwright Test Fixtures
 *
 * Provides core reusable test fixtures for authentication and organization context.
 * These are base fixtures that other entity fixtures can extend.
 *
 * For form-specific fixtures (testForm, testFormFast), import from:
 * - `../entities/form/fixtures` for the extended test
 * - Or use `formTest` from `../entities`
 *
 * @example
 * ```ts
 * // For tests that only need auth:
 * import { test, expect } from '../app/fixtures';
 *
 * test('my test', async ({ authedPage, orgSlug }) => {
 *   await authedPage.goto(`/${orgSlug}/dashboard`);
 * });
 *
 * // For tests that need form fixtures:
 * import { test, expect } from '../entities/form/fixtures';
 *
 * test('form test', async ({ authedPage, orgSlug, testFormFast }) => {
 *   await authedPage.goto(testFormFast.studioUrl);
 * });
 * ```
 */
import { test as base, Page } from '@playwright/test';
import { authTestIds } from '@/shared/constants/testIds';

// E2E test user credentials - use environment variables in CI
const E2E_USER = {
  email: process.env.E2E_USER_EMAIL || 'testimonials-ms-e2e-tests@brownforge.com',
  password: process.env.E2E_USER_PASSWORD || 'Kh5x%8-Q6-qpU+D',
};

export interface AppFixtures {
  /** Authenticated page with logged-in user */
  authedPage: Page;
  /** Organization slug extracted from authenticated page URL */
  orgSlug: string;
}

/**
 * Extract organization slug from dashboard URL
 * URL format: /{org-slug}/dashboard or /{org-slug}/forms/...
 *
 * The org slug is always the first path segment after the domain.
 */
function extractOrgSlug(url: string): string {
  const urlObj = new URL(url);
  const segments = urlObj.pathname.split('/').filter(Boolean);
  // First segment is the org slug
  return segments[0] || '';
}

export const test = base.extend<AppFixtures>({
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
    const url = authedPage.url();
    const orgSlug = extractOrgSlug(url);
    if (!orgSlug) {
      throw new Error(`Could not extract organization slug from URL: ${url}`);
    }
    await use(orgSlug);
  },
});

export { expect } from '@playwright/test';
