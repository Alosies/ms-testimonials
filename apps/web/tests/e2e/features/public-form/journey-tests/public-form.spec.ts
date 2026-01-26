/**
 * Public Form Journey Test
 *
 * Tests the customer-facing public form experience including:
 * - Form persistence (localStorage state restoration)
 * - Analytics events (form_started on load)
 * - Submit button behavior (shows "Submit" on step before thank_you)
 *
 * Uses branchedFormViaApi to test a form with multiple steps and branching.
 *
 * Form Structure (branchedFormViaApi):
 * - Shared: welcome(0), question(1), question(2), question(3), rating(4)
 * - Testimonial (rating>=4): question(5), testimonial_write(6), consent(7), thank_you(8)
 * - Improvement (rating<4): question(5), thank_you(6)
 *
 * ## ADR Reference
 * - ADR-018: Form Persistence & Analytics
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createPublicFormPage } from '@e2e/shared';

/**
 * MVP: Combined test for public form navigation and thank_you step.
 */
test.describe('Public Form', () => {
  test('can navigate through form to thank_you step', async ({ page, branchedFormViaApi }) => {
    const publicForm = createPublicFormPage(page);

    // Block analytics requests
    await page.route('**/analytics/**', (route) => route.fulfill({ status: 200, body: '{"success":true}' }));

    await test.step('1. Load form and start', async () => {
      await publicForm.goto(branchedFormViaApi.publicUrl);
      await expect(publicForm.container).toBeVisible();
      await publicForm.expectStepType('welcome');

      // Click start button
      await page.getByRole('button', { name: /start|begin|get started/i }).click();
      await page.waitForTimeout(500);
    });

    await test.step('2. Navigate through all steps to thank_you', async () => {
      let maxIterations = 15;
      let currentStepType = await publicForm.getCurrentStepType();

      while (currentStepType !== 'thank_you' && maxIterations > 0) {
        // Handle rating step - select highest rating and wait for button to be enabled
        if (currentStepType === 'rating') {
          const star = page.getByTestId('rating-star-5');
          await expect(star).toBeVisible({ timeout: 3000 });
          await star.click();

          // Wait for the Continue button to become enabled after rating selection
          await expect(publicForm.continueButton).toBeEnabled({ timeout: 3000 });
        }

        // Handle testimonial_write step - select manual path and enter text
        if (currentStepType === 'testimonial_write') {
          // Click "Write it yourself" button to select manual path
          const manualPathButton = page.getByRole('button', { name: /write it yourself/i });
          await expect(manualPathButton).toBeVisible({ timeout: 3000 });
          await manualPathButton.click();

          // Wait for textarea to appear and enter enough text (min 50 chars)
          const textarea = page.locator('textarea');
          await expect(textarea).toBeVisible({ timeout: 3000 });
          await textarea.fill('This is a great product that has helped me tremendously. I would highly recommend it to anyone looking for a solution.');

          // Wait for Continue button to be enabled
          await expect(publicForm.continueButton).toBeEnabled({ timeout: 3000 });
        }

        // Click Submit or Continue (wait for them to be enabled)
        const submitVisible = await publicForm.submitButton.isVisible();
        const continueVisible = await publicForm.continueButton.isVisible();

        if (submitVisible) {
          await expect(publicForm.submitButton).toBeEnabled({ timeout: 2000 });
          await publicForm.clickSubmit();
        } else if (continueVisible) {
          await expect(publicForm.continueButton).toBeEnabled({ timeout: 2000 });
          await publicForm.clickContinue();
        } else {
          // No buttons - might be on welcome or thank_you
          break;
        }

        await page.waitForTimeout(300);
        currentStepType = await publicForm.getCurrentStepType();
        maxIterations--;
      }

      // Verify we reached thank_you
      await publicForm.expectStepType('thank_you');
    });

    await test.step('3. Thank you step has no navigation buttons', async () => {
      await publicForm.expectNoNavigation();
    });
  });

  test('form persistence saves state to localStorage', async ({ page, branchedFormViaApi }) => {
    const publicForm = createPublicFormPage(page);

    // Block analytics requests
    await page.route('**/analytics/**', (route) => route.fulfill({ status: 200, body: '{"success":true}' }));

    await test.step('1. Navigate past welcome step', async () => {
      await publicForm.goto(branchedFormViaApi.publicUrl);
      await expect(publicForm.container).toBeVisible();

      // Click start on welcome step
      await page.getByRole('button', { name: /start|begin|get started/i }).click();
      await page.waitForTimeout(500);
    });

    await test.step('2. Verify localStorage has persisted state', async () => {
      // Check localStorage for form persistence data
      // Keys: testimonials_form_{formId} for state, testimonials_session_{formId} for session
      const localStorageData = await page.evaluate((formId) => {
        const stateKey = `testimonials_form_${formId}`;
        const sessionKey = `testimonials_session_${formId}`;
        return {
          hasState: localStorage.getItem(stateKey) !== null,
          hasSession: localStorage.getItem(sessionKey) !== null,
          state: localStorage.getItem(stateKey),
        };
      }, branchedFormViaApi.id);

      expect(localStorageData.hasSession).toBe(true);
      expect(localStorageData.hasState).toBe(true);

      // Parse and verify state structure
      if (localStorageData.state) {
        const parsedState = JSON.parse(localStorageData.state);
        expect(parsedState).toHaveProperty('currentStepIndex');
        expect(parsedState).toHaveProperty('savedAt');
        expect(parsedState.currentStepIndex).toBeGreaterThanOrEqual(1);
      }
    });

    await test.step('3. Reload page and verify state restoration', async () => {
      // Reload the page
      await page.reload();
      await publicForm.waitForLoad();

      // Wait for restoration
      await page.waitForTimeout(500);

      // After reload, the form should restore to the saved step (not welcome)
      const stepType = await publicForm.getCurrentStepType();
      // Should NOT be on welcome step after restoration
      expect(stepType).not.toBe('welcome');
    });
  });

  test('analytics form_started event fires on load', async ({ page, branchedFormViaApi }) => {
    // Track analytics requests
    const analyticsRequests: { url: string; body: string }[] = [];

    await page.route('**/analytics/**', async (route) => {
      const request = route.request();
      analyticsRequests.push({
        url: request.url(),
        body: request.postData() || '',
      });
      await route.fulfill({ status: 200, body: '{"success":true}' });
    });

    const publicForm = createPublicFormPage(page);
    await publicForm.goto(branchedFormViaApi.publicUrl);
    await expect(publicForm.container).toBeVisible();

    // Wait for analytics request
    await page.waitForTimeout(500);

    // Verify form_started event was sent
    const formStartedEvent = analyticsRequests.find((req) =>
      req.body.includes('form_started'),
    );
    expect(formStartedEvent).toBeDefined();
  });

  test('submit button shows on step before thank_you', async ({ page, branchedFormViaApi }) => {
    const publicForm = createPublicFormPage(page);

    // Block analytics
    await page.route('**/analytics/**', (route) => route.fulfill({ status: 200, body: '{"success":true}' }));

    await publicForm.goto(branchedFormViaApi.publicUrl);

    // Navigate through form until we see Submit button
    await page.getByRole('button', { name: /start|begin|get started/i }).click();
    await page.waitForTimeout(500);

    let maxIterations = 20;
    let foundSubmitButton = false;
    let stepCount = 0;

    while (maxIterations > 0) {
      await page.waitForTimeout(300);
      const currentStepType = await publicForm.getCurrentStepType();
      stepCount++;

      // Handle rating step - click highest star first
      if (currentStepType === 'rating') {
        const highestStar = page.getByTestId('rating-star-5');
        await expect(highestStar).toBeVisible({ timeout: 3000 });
        await highestStar.click();
        await page.waitForTimeout(500);
      }

      // Handle testimonial_write step - select manual path and enter text
      if (currentStepType === 'testimonial_write') {
        const manualPathButton = page.getByRole('button', { name: /write it yourself/i });
        await expect(manualPathButton).toBeVisible({ timeout: 3000 });
        await manualPathButton.click();

        const textarea = page.locator('textarea');
        await expect(textarea).toBeVisible({ timeout: 3000 });
        await textarea.fill('This is a great product that has helped me tremendously. I would highly recommend it to anyone looking for a solution.');
        await page.waitForTimeout(500);
      }

      // Check for submit button
      const hasSubmit = await publicForm.submitButton.isVisible();
      const hasContinue = await publicForm.continueButton.isVisible();

      if (hasSubmit) {
        foundSubmitButton = true;

        // Verify the submit button text contains "Submit"
        const buttonText = await publicForm.submitButton.textContent();
        expect(buttonText?.toLowerCase()).toContain('submit');

        // Verify continue button is NOT visible when submit is visible
        await expect(publicForm.continueButton).not.toBeVisible();
        break;
      }

      // Continue navigation
      if (hasContinue) {
        await publicForm.clickContinue();
      } else if (currentStepType === 'thank_you' || currentStepType === 'welcome') {
        // No navigation buttons on these steps
        break;
      } else {
        // No buttons visible and not on terminal step
        break;
      }

      maxIterations--;
    }

    // The submit button should appear on the step before thank_you (consent step)
    expect(foundSubmitButton).toBe(true);
  });
});
