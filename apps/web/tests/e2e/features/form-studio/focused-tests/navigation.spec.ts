/**
 * Studio Navigation Tests (Focused)
 *
 * Detailed tests for navigation features in the Form Studio.
 * Run these when journey tests fail to pinpoint navigation issues.
 *
 * @see ./actions/ for shared action helpers
 */
import { test, expect } from '@e2e/entities/form/fixtures';
import { createStudioPage } from '@e2e/shared';
import { createStudioActions } from '@e2e/features/form-studio/actions';

test.describe('Studio Navigation', () => {
  test.describe('Sidebar Click Navigation', () => {
    test('clicking sidebar step scrolls canvas to that step', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      // Click on the last step
      const lastStep = steps[steps.length - 1];
      await actions.select.selectStep(lastStep.id);

      // Focused assertions: verify scroll and selection
      await studio.expectCanvasStepInViewport(lastStep.id);
      await studio.expectSidebarStepSelected(lastStep.id);
    });

    test('clicking different sidebar steps navigates to each', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(3);

      const firstStep = steps[0];
      const lastStep = steps[steps.length - 1];
      const middleStep = steps[Math.floor(steps.length / 2)];

      // Click through and verify canvas viewport for each
      await actions.select.selectStep(firstStep.id);
      await studio.expectCanvasStepInViewport(firstStep.id);

      await actions.select.selectStep(lastStep.id);
      await studio.expectCanvasStepInViewport(lastStep.id);

      await actions.select.selectStep(middleStep.id);
      await studio.expectCanvasStepInViewport(middleStep.id);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('arrow down navigates to next step', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      const firstStep = steps[0];
      const secondStep = steps[1];

      // Start at first step
      await actions.select.selectStep(firstStep.id);

      // Navigate down
      await actions.nav.navigateDown(secondStep.id);

      // Focused assertion: verify canvas also scrolled
      await studio.expectCanvasStepInViewport(secondStep.id);
    });

    test('arrow up navigates to previous step', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      const firstStep = steps[0];
      const secondStep = steps[1];

      // Start at second step
      await actions.select.selectStep(secondStep.id);

      // Navigate up
      await actions.nav.navigateUp(firstStep.id);

      // Focused assertion: verify canvas also scrolled
      await studio.expectCanvasStepInViewport(firstStep.id);
    });

    test('keyboard navigation wraps or stops at boundaries', async ({ authedPage, formViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadWithSteps(formViaApi);

      const steps = formViaApi.steps ?? [];
      expect(steps.length).toBeGreaterThanOrEqual(2);

      const firstStep = steps[0];
      const lastStep = steps[steps.length - 1];

      // Test top boundary: start at first step, press up
      await actions.select.selectStep(firstStep.id);
      await studio.navigateUp();
      await studio.waitForScrollSettle();

      // Should either stay at first or wrap to last
      const selectedAfterUp = await studio.getSelectedStepId();
      expect(selectedAfterUp).not.toBeNull();
      expect([firstStep.id, lastStep.id]).toContain(selectedAfterUp);

      // Test bottom boundary: start at last step, press down
      await actions.select.selectStep(lastStep.id);
      await studio.navigateDown();
      await studio.waitForScrollSettle();

      // Should either stay at last or wrap to first
      const selectedAfterDown = await studio.getSelectedStepId();
      expect(selectedAfterDown).not.toBeNull();
      expect([firstStep.id, lastStep.id]).toContain(selectedAfterDown);
    });
  });

  test.describe('Branched Form Navigation', () => {
    test('left/right arrows switch between branch flows', async ({ authedPage, branchedFormViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

      // Enter branch area
      await actions.branch.enterBranchArea(branchedFormViaApi);

      // Verify in testimonial branch
      await actions.branch.expectInTestimonialBranch(branchedFormViaApi);
      await studio.expectFlowFocused('testimonial');

      // Switch to improvement
      await actions.branch.switchToImprovement();
      await actions.branch.expectInImprovementBranch(branchedFormViaApi);
      await studio.expectFlowNotFocused('testimonial');

      // Switch back to testimonial
      await actions.branch.switchToTestimonial();
      await actions.branch.expectInTestimonialBranch(branchedFormViaApi);
      await studio.expectFlowNotFocused('improvement');
    });

    test('can navigate through all steps in branched form', async ({ authedPage, branchedFormViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

      // Verify all steps from all flows are accessible
      const allSteps = branchedFormViaApi.allSteps;
      expect(allSteps.length).toBeGreaterThanOrEqual(5);

      // Navigate to shared flow step
      const welcomeStep = branchedFormViaApi.sharedFlow.steps.find(s => s.stepType === 'welcome');
      expect(welcomeStep).toBeDefined();
      await actions.select.selectStep(welcomeStep!.id);

      // Navigate to testimonial flow step
      const lastTestimonialStep = branchedFormViaApi.testimonialFlow.steps[
        branchedFormViaApi.testimonialFlow.steps.length - 1
      ];
      await actions.select.selectStep(lastTestimonialStep.id);
    });

    test('clicking on non-first steps in branch flows selects correct step', async ({ authedPage, branchedFormViaApi }) => {
      const studio = createStudioPage(authedPage);
      const actions = createStudioActions(studio);

      await actions.setup.loadStudio(branchedFormViaApi.studioUrl);

      const testimonialSteps = branchedFormViaApi.testimonialFlow.steps;
      const improvementSteps = branchedFormViaApi.improvementFlow.steps;

      expect(testimonialSteps.length).toBeGreaterThanOrEqual(2);
      expect(improvementSteps.length).toBeGreaterThanOrEqual(2);

      // Click on second step in testimonial flow (not the first)
      const secondTestimonialStep = testimonialSteps[1];
      await studio.getStepCardByIdOnCanvas(secondTestimonialStep.id).click();
      await studio.waitForScrollSettle();

      // Verify the correct step is selected (not the first step)
      await studio.expectSidebarStepSelected(secondTestimonialStep.id);
      await studio.expectFlowFocused('testimonial');

      // Click on last step in improvement flow
      const lastImprovementStep = improvementSteps[improvementSteps.length - 1];
      await studio.getStepCardByIdOnCanvas(lastImprovementStep.id).click();
      await studio.waitForScrollSettle();

      // Verify the correct step is selected and flow switched
      await studio.expectSidebarStepSelected(lastImprovementStep.id);
      await studio.expectFlowFocused('improvement');
    });
  });
});
