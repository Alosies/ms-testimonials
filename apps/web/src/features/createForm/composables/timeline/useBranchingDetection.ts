/**
 * Branching Detection - Auto-detect branching from loaded steps
 *
 * Extracted from useTimelineBranching for maintainability.
 * Detects and syncs branching state from loaded steps.
 *
 * Updated for ADR-009 Phase 2: Uses flowId for detection.
 * Falls back to flowMembership for backward compatibility.
 */
import type { Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { DEFAULT_BRANCHING_CONFIG } from '@/entities/form';

interface BranchingDetectionDeps {
  branchingConfig: Ref<BranchingConfig>;
}

/**
 * Check if steps have multiple unique flowIds (indicates branching)
 * Returns true if more than one unique flowId exists
 */
function hasMultipleFlows(steps: FormStep[]): boolean {
  const flowIds = new Set(steps.map(s => s.flowId).filter(Boolean));
  return flowIds.size > 1;
}

/**
 * Check if any step has branched flow membership (legacy detection)
 */
function hasBranchedFlowMembership(steps: FormStep[]): boolean {
  return steps.some(
    s => s.flowMembership === 'testimonial' || s.flowMembership === 'improvement',
  );
}

/**
 * Find shared steps - those with flowMembership 'shared' or matching shared flowId
 */
function findSharedSteps(steps: FormStep[]): FormStep[] {
  // If steps have flowId, find the shared flow ID first
  const stepsWithFlowId = steps.filter(s => s.flowId);
  if (stepsWithFlowId.length > 0) {
    // Find shared flow ID from a step with flowMembership 'shared'
    const sharedStep = steps.find(s => s.flowMembership === 'shared' && s.flowId);
    if (sharedStep) {
      return steps.filter(s => s.flowId === sharedStep.flowId);
    }
  }
  // Fall back to flowMembership check
  return steps.filter(s => s.flowMembership === 'shared');
}

export function useBranchingDetection(deps: BranchingDetectionDeps) {
  const { branchingConfig } = deps;

  /**
   * Detect and sync branching state from loaded steps.
   * Called when steps are loaded from the database to ensure branching UI
   * reflects the actual state, even if branching_config wasn't loaded separately.
   *
   * Detection logic (ADR-009 Phase 2):
   * 1. Check for multiple unique flowIds (primary detection)
   * 2. Fall back to flowMembership check for backward compatibility
   * 3. The branch point is the last shared step that's a rating type
   * 4. Uses default threshold of 4 if not already set
   */
  function detectBranchingFromSteps(loadedSteps: FormStep[]) {
    // Primary detection: Check for multiple flows by flowId
    // Secondary detection: Check flowMembership for backward compatibility
    const hasBranching = hasMultipleFlows(loadedSteps) || hasBranchedFlowMembership(loadedSteps);

    if (!hasBranching) {
      // No branched steps - ensure branching is disabled
      if (branchingConfig.value.enabled) {
        branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };
      }
      return;
    }

    // Branched steps exist - ensure branching config reflects this
    if (branchingConfig.value.enabled && branchingConfig.value.ratingStepId) {
      // Already configured, verify the rating step exists
      const ratingStepExists = loadedSteps.some(s => s.id === branchingConfig.value.ratingStepId);
      if (ratingStepExists) {
        return; // Config is valid
      }
    }

    // Need to detect the branch point
    // Find the last shared step that's a rating type (the branch point)
    const sharedSteps = findSharedSteps(loadedSteps);
    const ratingStep = [...sharedSteps].reverse().find(s => s.stepType === 'rating');

    if (ratingStep) {
      // Found the rating step that acts as branch point
      branchingConfig.value = {
        enabled: true,
        threshold: branchingConfig.value.threshold || 4, // Use existing threshold or default
        ratingStepId: ratingStep.id,
      };
    } else {
      // Branched steps exist but no rating step found - unusual state
      // Enable branching without a specific branch point to show the UI
      // This shouldn't happen in normal usage but handles edge cases
      branchingConfig.value = {
        enabled: true,
        threshold: branchingConfig.value.threshold || 4,
        ratingStepId: null,
      };
    }
  }

  return {
    detectBranchingFromSteps,
  };
}
