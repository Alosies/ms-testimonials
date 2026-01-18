/**
 * Form Studio Journey Test
 *
 * A single comprehensive test that validates all critical studio functionality
 * in one continuous flow. One setup, one teardown, maximum efficiency.
 *
 * Uses branchedFormViaApi which covers all features:
 * - Regular form functionality (shared flow steps)
 * - Branch navigation (testimonial/improvement flows)
 * - Keyboard shortcuts (E to edit, Mod+D to delete)
 * - Properties panel validation for each step type
 *
 * ## When to Run
 * - After major commits
 * - Before merging to main branch
 * - CI quick-check pipeline
 *
 * ## If Journey Test Fails
 * Run focused tests to pinpoint the issue:
 * - focused-tests/core.spec.ts - Core studio functionality
 * - focused-tests/navigation.spec.ts - Navigation features
 * - focused-tests/keyboard-shortcuts.spec.ts - Keyboard shortcuts
 * - focused-tests/properties-panel.spec.ts - Properties panel validation
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test('form studio complete journey', { tag: '@smoke' }, async ({ authedPage, branchedFormViaApi }) => {
  const studio = createStudioPage(authedPage);
  const { setup, select, nav, branch, manage, props } = createStudioActions(studio);

  // Get steps from shared flow for basic operations
  const sharedSteps = branchedFormViaApi.sharedFlow.steps;
  const allSteps = branchedFormViaApi.allSteps;
  const ratingStep = sharedSteps.find(s => s.stepType === 'rating')!;
  const questionStep = sharedSteps.find(s => s.stepType === 'question')!;

  // Welcome step may not exist in test data - get first shared step as fallback
  const welcomeStep = sharedSteps.find(s => s.stepType === 'welcome') ?? sharedSteps[0];

  await test.step('1. Studio loads correctly', async () => {
    await setup.loadStudio(branchedFormViaApi.studioUrl);
    await expect(studio.sidebar).toBeVisible();
    await expect(studio.canvas).toBeVisible();
    await expect(studio.propertiesPanel).toBeVisible();
  });

  await test.step('2. Sidebar click navigation', async () => {
    await select.selectStep(welcomeStep.id);
    await select.selectStep(ratingStep.id);
  });

  await test.step('3. Keyboard navigation (up/down)', async () => {
    await select.selectStep(welcomeStep.id);
    await nav.navigateDown();
    await nav.navigateDown();
    await nav.navigateUp();
    await nav.navigateUp(welcomeStep.id);
  });

  await test.step('4. Keyboard shortcuts (E to edit, Mod+D to delete)', async () => {
    await select.selectStep(questionStep.id);
    // E key opens step editor for correct step
    await manage.editStep(questionStep.id);
    // Close editor to test delete shortcut separately
    await studio.page.keyboard.press('Escape');
    await studio.expectStepEditorHidden();
    // Mod+D shows confirmation modal - cancel to preserve step for later tests
    await manage.deleteStepAndCancel();
  });

  await test.step('5. Enter branch area', async () => {
    await branch.enterBranchArea(branchedFormViaApi);
    await branch.expectInTestimonialBranch(branchedFormViaApi);
  });

  await test.step('6. Switch branches (left/right)', async () => {
    await branch.switchToImprovement();
    await branch.expectInImprovementBranch(branchedFormViaApi);
    await branch.switchToTestimonial();
    await branch.expectInTestimonialBranch(branchedFormViaApi);
  });

  await test.step('7. Access all branch steps via sidebar', async () => {
    await select.clickThroughSteps(branchedFormViaApi.testimonialFlow.steps);
    await select.clickThroughSteps(branchedFormViaApi.improvementFlow.steps);
  });

  await test.step('8. Return to shared flow', async () => {
    await select.selectStep(welcomeStep.id);
  });

  await test.step('9. Add step then delete with Mod+D', async () => {
    const initialCount = allSteps.length;
    const newCount = await manage.addStep('Question');
    expect(newCount).toBe(initialCount + 1);

    // Explicitly select the newly added step (last step) before deleting
    // This ensures we delete the correct step and not an existing one
    await select.selectStepByIndex(newCount - 1);
    await studio.waitForScrollSettle();

    // Confirm deletion here (step 4 tested cancel path)
    await manage.deleteStepAndConfirm();
    await studio.expectStepCount(initialCount);
  });

  await test.step('10. Properties panel - Welcome step', async () => {
    // Check if actual welcome step exists in fixture data
    const actualWelcomeStep = sharedSteps.find(s => s.stepType === 'welcome');
    if (actualWelcomeStep) {
      await select.selectStep(actualWelcomeStep.id);
      await props.verifyWelcomePanel();
    } else {
      // No welcome step - select first step and verify it's accessible
      await select.selectStepByIndex(0);
      await expect(studio.propertiesPanel).toBeVisible();
    }
  });

  await test.step('11. Properties panel - Question step', async () => {
    await select.selectStep(questionStep.id);
    await props.verifyQuestionPanel();
  });

  await test.step('12. Properties panel - Rating step', async () => {
    await select.selectStep(ratingStep.id);
    await props.verifyRatingPanel();
  });

  await test.step('13. Properties panel - Consent step', async () => {
    const consentStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'consent');
    if (consentStep) {
      await select.selectStep(consentStep.id);
      await props.verifyConsentPanel();
    }
  });

  await test.step('14. Properties panel - Thank You step', async () => {
    const thankYouStep = branchedFormViaApi.testimonialFlow.steps.find(s => s.stepType === 'thank_you');
    if (thankYouStep) {
      await select.selectStep(thankYouStep.id);
      await props.verifyThankYouPanel();
    }
  });
});
