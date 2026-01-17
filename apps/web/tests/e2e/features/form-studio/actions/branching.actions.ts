/**
 * Studio Branching Actions
 *
 * Actions for branch navigation (left/right) in branched forms.
 */
import { expect } from '@playwright/test';
import type { StudioPage } from '@e2e/shared/pages/studio.page';
import type { TestBranchedFormData } from '@e2e/entities/form/types';

export function createBranchingActions(studio: StudioPage) {
  return {
    /**
     * Switch to improvement branch (navigate right)
     */
    async switchToImprovement() {
      await studio.navigateRight();
      await studio.waitForScrollSettle();
      await studio.expectFlowFocused('improvement');
    },

    /**
     * Switch to testimonial branch (navigate left)
     */
    async switchToTestimonial() {
      await studio.navigateLeft();
      await studio.waitForScrollSettle();
      await studio.expectFlowFocused('testimonial');
    },

    /**
     * Enter branch area from rating step
     * Navigates to rating step, then down into testimonial branch (default)
     */
    async enterBranchArea(branchedForm: TestBranchedFormData) {
      const ratingStep = branchedForm.sharedFlow.steps.find(s => s.stepType === 'rating');
      expect(ratingStep).toBeDefined();

      await studio.selectStepById(ratingStep!.id);
      await studio.waitForScrollSettle();
      await studio.navigateDown();
      await studio.waitForScrollSettle();
      await studio.expectFlowFocused('testimonial');
    },

    /**
     * Verify current step is in testimonial branch
     */
    async expectInTestimonialBranch(branchedForm: TestBranchedFormData) {
      const testimonialStepIds = new Set(
        branchedForm.testimonialFlow.steps.map(s => s.id)
      );
      const currentId = await studio.getSelectedStepId();
      expect(currentId).not.toBeNull();
      expect(testimonialStepIds.has(currentId!)).toBe(true);
    },

    /**
     * Verify current step is in improvement branch
     */
    async expectInImprovementBranch(branchedForm: TestBranchedFormData) {
      const improvementStepIds = new Set(
        branchedForm.improvementFlow.steps.map(s => s.id)
      );
      const currentId = await studio.getSelectedStepId();
      expect(currentId).not.toBeNull();
      expect(improvementStepIds.has(currentId!)).toBe(true);
    },
  };
}
