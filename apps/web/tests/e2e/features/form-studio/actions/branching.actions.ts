/**
 * Studio Branching Actions
 *
 * Actions for branch navigation (left/right) and outro navigation in branched forms.
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
     * Navigate to the last step in the testimonial branch
     */
    async navigateToLastTestimonialStep(branchedForm: TestBranchedFormData) {
      const lastStep = branchedForm.testimonialFlow.steps[branchedForm.testimonialFlow.steps.length - 1];
      expect(lastStep).toBeDefined();
      await studio.selectStepById(lastStep.id);
      await studio.waitForScrollSettle();
    },

    /**
     * Navigate to the last step in the improvement branch
     */
    async navigateToLastImprovementStep(branchedForm: TestBranchedFormData) {
      const lastStep = branchedForm.improvementFlow.steps[branchedForm.improvementFlow.steps.length - 1];
      expect(lastStep).toBeDefined();
      await studio.selectStepById(lastStep.id);
      await studio.waitForScrollSettle();
    },

    /**
     * Navigate to the first outro step (contact_info)
     */
    async navigateToFirstOutroStep(branchedForm: TestBranchedFormData) {
      const firstOutroStep = branchedForm.outroFlow.steps[0];
      expect(firstOutroStep).toBeDefined();
      await studio.selectStepById(firstOutroStep.id);
      await studio.waitForScrollSettle();
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

    /**
     * Verify current step is in outro section
     */
    async expectInOutro(branchedForm: TestBranchedFormData) {
      const outroStepIds = new Set(
        branchedForm.outroFlow.steps.map(s => s.id)
      );
      const currentId = await studio.getSelectedStepId();
      expect(currentId).not.toBeNull();
      expect(outroStepIds.has(currentId!)).toBe(true);
    },

    /**
     * Verify current step is the last step in testimonial branch
     */
    async expectAtLastTestimonialStep(branchedForm: TestBranchedFormData) {
      const lastStep = branchedForm.testimonialFlow.steps[branchedForm.testimonialFlow.steps.length - 1];
      const currentId = await studio.getSelectedStepId();
      expect(currentId).toBe(lastStep.id);
    },

    /**
     * Verify current step is the first outro step
     */
    async expectAtFirstOutroStep(branchedForm: TestBranchedFormData) {
      const firstOutroStep = branchedForm.outroFlow.steps[0];
      const currentId = await studio.getSelectedStepId();
      expect(currentId).toBe(firstOutroStep.id);
    },

    /**
     * Expand current flow (F key)
     * Must be focused on a branch step first
     */
    async expandCurrentFlow() {
      await studio.expandFlow();
      await studio.waitForScrollSettle();
      await studio.expectFlowExpanded();
    },

    /**
     * Collapse expanded flow (Escape key)
     * Returns to side-by-side view
     */
    async collapseExpandedFlow() {
      await studio.collapseFlow();
      await studio.waitForScrollSettle();
      await studio.expectFlowCollapsed();
    },

    /**
     * Expand and verify a specific flow type
     */
    async expandAndVerifyFlow(flowType: 'testimonial' | 'improvement') {
      await studio.expandFlow();
      await studio.waitForScrollSettle();
      await studio.expectExpandedFlowType(flowType);
    },
  };
}
