/**
 * Branching Detection - Auto-detect branching from loaded steps
 *
 * Extracted from useTimelineBranching for maintainability.
 * Detects and syncs branching state from loaded steps.
 */
import type { Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { DEFAULT_BRANCHING_CONFIG } from '@/entities/form';

interface BranchingDetectionDeps {
  branchingConfig: Ref<BranchingConfig>;
}

export function useBranchingDetection(deps: BranchingDetectionDeps) {
  const { branchingConfig } = deps;

  /**
   * Detect and sync branching state from loaded steps.
   * Called when steps are loaded from the database to ensure branching UI
   * reflects the actual state, even if branching_config wasn't loaded separately.
   *
   * Detection logic:
   * 1. If any step has non-shared flowMembership, branching is enabled
   * 2. The branch point is the last 'shared' step that's a rating type
   * 3. Uses default threshold of 4 if not already set
   */
  function detectBranchingFromSteps(loadedSteps: FormStep[]) {
    // Check if any step has branched flow membership
    const hasBranchedSteps = loadedSteps.some(
      s => s.flowMembership === 'testimonial' || s.flowMembership === 'improvement',
    );

    if (!hasBranchedSteps) {
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
    const sharedSteps = loadedSteps.filter(s => s.flowMembership === 'shared');
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
