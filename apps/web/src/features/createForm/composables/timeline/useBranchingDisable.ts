/**
 * Branching Disable Operations
 *
 * Extracted from useTimelineBranching for maintainability.
 * Contains the three disable variants and legacy wrapper.
 *
 * Updated for ADR-009 Phase 2: Uses flowId for step assignment.
 * Steps are reassigned to shared flow when branching is disabled.
 * Flow deletion is handled during save (useSaveFormSteps).
 */
import type { Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { DEFAULT_BRANCHING_CONFIG } from '@/entities/form';
import { reorderSteps } from '../../functions/stepOperations';

interface BranchingDisableDeps {
  steps: Ref<FormStep[]>;
  originalSteps: Ref<FormStep[]>;
  branchingConfig: Ref<BranchingConfig>;
  currentFlowFocus: Ref<'testimonial' | 'improvement' | null>;
}

/**
 * Check if a step's flow assignment changed from its original value
 * Checks both flowId and flowMembership for backward compatibility
 */
function hasFlowChanged(step: FormStep, originalSteps: FormStep[]): boolean {
  const original = originalSteps.find(s => s.id === step.id);
  if (!original) return true; // New step

  // Check flowId if available (ADR-009)
  if (step.flowId !== undefined && original.flowId !== undefined) {
    return step.flowId !== original.flowId;
  }

  // Fall back to flowMembership check
  return step.flowMembership !== original.flowMembership;
}

/**
 * Find the shared flow ID from steps
 * Returns the flowId of the first shared step, or undefined if not found
 */
function findSharedFlowId(steps: FormStep[]): string | undefined {
  const sharedStep = steps.find(s => s.flowMembership === 'shared' && s.flowId);
  return sharedStep?.flowId;
}

/**
 * Reassign a step to the shared flow
 * Updates both flowId (if available) and flowMembership
 */
function reassignToSharedFlow(step: FormStep, sharedFlowId: string | undefined): void {
  if (step.flowMembership !== 'shared') {
    step.flowMembership = 'shared';
  }
  if (sharedFlowId && step.flowId !== sharedFlowId) {
    step.flowId = sharedFlowId;
  }
}

export function useBranchingDisable(deps: BranchingDisableDeps) {
  const { steps, originalSteps, branchingConfig, currentFlowFocus } = deps;

  /**
   * Disable branching, keeping testimonial steps and removing improvement steps.
   * Testimonial steps are reassigned to the shared flow.
   *
   * Updated for ADR-009: Uses flowId for step assignment.
   * Flow deletion is handled during save.
   */
  function disableBranchingKeepTestimonial(): void {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Get the shared flow ID before filtering
    const sharedFlowId = findSharedFlowId(steps.value);

    // Remove improvement flow steps (filter by flowMembership for compatibility)
    const filtered = steps.value.filter(s => s.flowMembership !== 'improvement');
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Reassign remaining steps to shared flow
    steps.value.forEach(step => {
      reassignToSharedFlow(step, sharedFlowId);
      step.isModified = hasFlowChanged(step, originalSteps.value);
    });

    reorderSteps(steps.value);
    currentFlowFocus.value = null;
  }

  /**
   * Disable branching, keeping improvement steps and removing testimonial steps.
   * Improvement steps are reassigned to the shared flow.
   *
   * Updated for ADR-009: Uses flowId for step assignment.
   * Flow deletion is handled during save.
   */
  function disableBranchingKeepImprovement(): void {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Get the shared flow ID before filtering
    const sharedFlowId = findSharedFlowId(steps.value);

    // Remove testimonial flow steps (filter by flowMembership for compatibility)
    const filtered = steps.value.filter(s => s.flowMembership !== 'testimonial');
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Reassign remaining steps to shared flow
    steps.value.forEach(step => {
      reassignToSharedFlow(step, sharedFlowId);
      step.isModified = hasFlowChanged(step, originalSteps.value);
    });

    reorderSteps(steps.value);
    currentFlowFocus.value = null;
  }

  /**
   * Disable branching, removing all branched steps (both flows).
   * Only shared steps remain.
   *
   * Updated for ADR-009: Uses flowId for step assignment.
   * Flow deletion is handled during save.
   */
  function disableBranchingDeleteAll(): void {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Remove both testimonial and improvement flow steps
    const filtered = steps.value.filter(
      s => s.flowMembership !== 'testimonial' && s.flowMembership !== 'improvement',
    );
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Update modification state for remaining shared steps
    steps.value.forEach(step => {
      step.isModified = hasFlowChanged(step, originalSteps.value);
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
