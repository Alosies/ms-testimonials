import { test as base, Page } from '@playwright/test';

// Test user credentials - use environment variables in CI
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
};

export interface TestFixtures {
  authedPage: Page;
}

export const test = base.extend<TestFixtures>({
  authedPage: async ({ page }, use) => {
    // Navigate to login
    await page.goto('/login');

    // Fill login form
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);

    // Submit and wait for redirect
    await page.getByRole('button', { name: /sign in|log in|submit/i }).click();
    await page.waitForURL(/dashboard|forms|home/, { timeout: 10000 });

    await use(page);
  },
});

export { expect } from '@playwright/test';
