/**
 * Form Studio Journey Test
 *
 * A single comprehensive test that validates all critical studio functionality
 * in one continuous flow. One setup, one teardown, maximum efficiency.
 *
 * Uses branchedFormViaApi which covers all features:
 * - Regular form functionality (shared flow steps)
 * - Branch navigation (testimonial/improvement flows)
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
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test('form studio complete journey', async ({ authedPage, branchedFormViaApi }) => {
  const studio = createStudioPage(authedPage);
  const actions = createStudioActions(studio);

  // Get steps from shared flow for basic operations
  const sharedSteps = branchedFormViaApi.sharedFlow.steps;
  const allSteps = branchedFormViaApi.allSteps;

  // ==========================================
  // 1. STUDIO LOADS CORRECTLY
  // ==========================================
  await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

  await expect(studio.sidebar).toBeVisible();
  await expect(studio.canvas).toBeVisible();
  await expect(studio.propertiesPanel).toBeVisible();

  // ==========================================
  // 2. SIDEBAR CLICK NAVIGATION
  // ==========================================
  // Click through shared flow steps
  const welcomeStep = sharedSteps.find(s => s.stepType === 'welcome')!;
  const ratingStep = sharedSteps.find(s => s.stepType === 'rating')!;

  await actions.select.selectStep(welcomeStep.id);
  await actions.select.selectStep(ratingStep.id);

  // ==========================================
  // 3. KEYBOARD NAVIGATION (UP/DOWN)
  // ==========================================
  // Start at welcome step
  await actions.select.selectStep(welcomeStep.id);

  // Navigate down through shared flow
  await actions.nav.navigateDown();
  await actions.nav.navigateDown();

  // Navigate back up
  await actions.nav.navigateUp();
  await actions.nav.navigateUp(welcomeStep.id);

  // ==========================================
  // 4. ENTER BRANCH AREA
  // ==========================================
  await actions.branch.enterBranchArea(branchedFormViaApi);
  await actions.branch.expectInTestimonialBranch(branchedFormViaApi);

  // ==========================================
  // 5. SWITCH BRANCHES (LEFT/RIGHT)
  // ==========================================
  await actions.branch.switchToImprovement();
  await actions.branch.expectInImprovementBranch(branchedFormViaApi);

  await actions.branch.switchToTestimonial();
  await actions.branch.expectInTestimonialBranch(branchedFormViaApi);

  // ==========================================
  // 6. ACCESS ALL BRANCH STEPS VIA SIDEBAR
  // ==========================================
  await actions.select.clickThroughSteps(branchedFormViaApi.testimonialFlow.steps);
  await actions.select.clickThroughSteps(branchedFormViaApi.improvementFlow.steps);

  // ==========================================
  // 7. RETURN TO SHARED FLOW
  // ==========================================
  await actions.select.selectStep(welcomeStep.id);

  // ==========================================
  // 8. ADD STEP
  // ==========================================
  const initialCount = allSteps.length;
  const newCount = await actions.manage.addStep('Question');
  expect(newCount).toBe(initialCount + 1);

  // Verify new step is selectable
  await actions.select.selectStepByIndex(newCount - 1);
  await expect(studio.propertiesPanel).toBeVisible();

  // ==========================================
  // 9. PROPERTIES PANEL INTERACTION
  // ==========================================
  await actions.select.selectStep(welcomeStep.id);
  await expect(studio.propertiesPanel).toBeVisible();

  await actions.select.selectStep(ratingStep.id);
  await expect(studio.propertiesPanel).toBeVisible();

  // ==========================================
  // JOURNEY COMPLETE
  // ==========================================
});
