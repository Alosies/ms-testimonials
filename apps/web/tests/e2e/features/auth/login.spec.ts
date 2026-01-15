/**
 * Authentication Tests
 *
 * Tests for user authentication flows.
 */
import { test, expect } from '../../app/fixtures';

test.describe('Authentication', () => {
  test('user can login and reach dashboard', async ({ authedPage }) => {
    // authedPage fixture handles login
    // Just verify we're on an authenticated page
    await expect(authedPage).toHaveURL(/dashboard|forms/);
  });
});
