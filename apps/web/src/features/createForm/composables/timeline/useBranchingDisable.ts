/**
 * Branching Disable Operations
 *
 * Extracted from useTimelineBranching for maintainability.
 * Contains the three disable variants and legacy wrapper.
 */
import type { Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { DEFAULT_BRANCHING_CONFIG } from '@/entities/form';
import { reorderSteps } from './useStepOperations';

interface BranchingDisableDeps {
  steps: Ref<FormStep[]>;
  originalSteps: Ref<FormStep[]>;
  branchingConfig: Ref<BranchingConfig>;
  currentFlowFocus: Ref<'testimonial' | 'improvement' | null>;
}

/**
 * Check if a step's flowMembership changed from its original value
 */
function hasFlowMembershipChanged(step: FormStep, originalSteps: FormStep[]): boolean {
  const original = originalSteps.find(s => s.id === step.id);
  if (!original) return true; // New step
  return step.flowMembership !== original.flowMembership;
}

export function useBranchingDisable(deps: BranchingDisableDeps) {
  const { steps, originalSteps, branchingConfig, currentFlowFocus } = deps;

  /**
   * Disable branching, keeping testimonial steps and removing improvement steps.
   * Testimonial steps are converted to shared.
   */
  function disableBranchingKeepTestimonial() {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Remove improvement flow steps
    const filtered = steps.value.filter(s => s.flowMembership !== 'improvement');
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Set all remaining as shared and update modification state
    steps.value.forEach(step => {
      if (step.flowMembership !== 'shared') {
        step.flowMembership = 'shared';
      }
      step.isModified = hasFlowMembershipChanged(step, originalSteps.value);
    });

    reorderSteps(steps.value);
    currentFlowFocus.value = null;
  }

  /**
   * Disable branching, keeping improvement steps and removing testimonial steps.
   * Improvement steps are converted to shared.
   */
  function disableBranchingKeepImprovement() {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Remove testimonial flow steps
    const filtered = steps.value.filter(s => s.flowMembership !== 'testimonial');
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Set all remaining as shared and update modification state
    steps.value.forEach(step => {
      if (step.flowMembership !== 'shared') {
        step.flowMembership = 'shared';
      }
      step.isModified = hasFlowMembershipChanged(step, originalSteps.value);
    });

    reorderSteps(steps.value);
    currentFlowFocus.value = null;
  }

  /**
   * Disable branching, removing all branched steps (both flows).
   * Only shared steps remain.
   */
  function disableBranchingDeleteAll() {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Remove both testimonial and improvement flow steps
    const filtered = steps.value.filter(
      s => s.flowMembership !== 'testimonial' && s.flowMembership !== 'improvement',
    );
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Update modification state for remaining shared steps
    steps.value.forEach(step => {
      step.isModified = hasFlowMembershipChanged(step, originalSteps.value);
    });

    reorderSteps(steps.value);
    currentFlowFocus.value = null;
  }

  /**
   * @deprecated Use disableBranchingKeepTestimonial, disableBranchingKeepImprovement, or disableBranchingDeleteAll
   * Legacy function kept for backward compatibility - behaves like disableBranchingKeepTestimonial
   */
  function disableBranching() {
    disableBranchingKeepTestimonial();
  }

  return {
    disableBranching,
    disableBranchingKeepTestimonial,
    disableBranchingKeepImprovement,
    disableBranchingDeleteAll,
  };
}
