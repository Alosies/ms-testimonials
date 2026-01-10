/**
 * Flow Navigation - Single Source of Truth for Form Flow Navigation
 *
 * Provides step-by-step navigation through the form flow structure.
 * Both canvas rendering and keyboard navigation use this same logic.
 *
 * Updated for ADR-009 Phase 2: Uses flowId when available, with
 * flowMembership fallback for backward compatibility.
 *
 * FLOW STRUCTURE:
 * Shared Steps: Welcome → Q1 → Q2 → Q3 → Rating (branch point)
 *                                          ↓
 *              ┌────────────────────────────┴────────────────────────────┐
 *              ↓                                                         ↓
 *       Testimonial Flow                                         Improvement Flow
 *       T1 → T2 → T3                                             I1 → I2
 *       (←→ switch between branches at same position)
 *
 * NAVIGATION RULES:
 * - Down from shared step: next shared step, or enter branch at branch point
 * - Up from shared step: previous shared step
 * - Down within branch: next step in same branch
 * - Up within branch: previous step, or exit to branch point if at first
 * - Left/Right: switch to same position in parallel branch
 */
import type {
  FlowStep,
  FlowNavigationDeps,
  FlowNavigationResult,
} from '../../models';

export function useFlowNavigation(deps: FlowNavigationDeps): FlowNavigationResult {
  const {
    steps,
    stepsBeforeBranch,
    testimonialSteps,
    improvementSteps,
    isBranchingEnabled,
    branchPointIndex,
  } = deps;

  /**
   * Find position of a step within a flow array
   */
  function findPositionInFlow(flowSteps: readonly FlowStep[], stepId: string): number {
    return flowSteps.findIndex((s) => s.id === stepId);
  }

  /**
   * Get which flow a step belongs to
   *
   * ADR-009 Phase 2: flowMembership is derived from flow.flow_type via stepTransform.
   * flowId is the source of truth for step-flow assignment in the database.
   */
  function getStepFlow(stepId: string): 'shared' | 'testimonial' | 'improvement' | null {
    const step = steps.value.find((s) => s.id === stepId);
    if (!step) return null;

    // If branching is disabled, everything is effectively shared
    if (!isBranchingEnabled.value) return 'shared';

    // flowMembership is derived from flow.flow_type by stepTransform
    const membership = step.flowMembership;
    if (membership === 'testimonial') return 'testimonial';
    if (membership === 'improvement') return 'improvement';
    return 'shared';
  }

  /**
   * Check if step is at the branch point (last shared step before branches)
   */
  function isAtBranchPoint(stepId: string): boolean {
    if (!isBranchingEnabled.value) return false;
    if (branchPointIndex.value === -1) return false;

    const branchPointStep = steps.value[branchPointIndex.value];
    return branchPointStep?.id === stepId;
  }

  /**
   * Check if step is in a branch
   */
  function isInBranch(stepId: string): boolean {
    const flow = getStepFlow(stepId);
    return flow === 'testimonial' || flow === 'improvement';
  }

  /**
   * Get branch point step ID
   */
  function getBranchPointStepId(): string | null {
    if (!isBranchingEnabled.value || branchPointIndex.value === -1) return null;
    return steps.value[branchPointIndex.value]?.id ?? null;
  }

  /**
   * Get first step of a branch
   */
  function getBranchEntryStepId(branch: 'testimonial' | 'improvement'): string | null {
    const branchSteps = branch === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
    return branchSteps[0]?.id ?? null;
  }

  /**
   * Navigate DOWN from a step
   *
   * Rules:
   * - In shared (not at branch point): next shared step
   * - At branch point: enter testimonial flow (default)
   * - In branch: next step in same branch (or null if at end)
   * - No branching: simple linear navigation
   */
  function getNextStepId(currentStepId: string): string | null {
    // No branching: simple linear navigation
    if (!isBranchingEnabled.value) {
      const currentIndex = steps.value.findIndex((s) => s.id === currentStepId);
      if (currentIndex === -1 || currentIndex >= steps.value.length - 1) return null;
      return steps.value[currentIndex + 1]?.id ?? null;
    }

    // At branch point: enter default branch (testimonial)
    if (isAtBranchPoint(currentStepId)) {
      return getBranchEntryStepId('testimonial');
    }

    // In a branch: navigate within the branch
    const flow = getStepFlow(currentStepId);
    if (flow === 'testimonial' || flow === 'improvement') {
      const branchSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
      const posInBranch = findPositionInFlow(branchSteps, currentStepId);
      if (posInBranch === -1 || posInBranch >= branchSteps.length - 1) return null;
      return branchSteps[posInBranch + 1]?.id ?? null;
    }

    // In shared steps: navigate to next shared step
    const posInShared = findPositionInFlow(stepsBeforeBranch.value, currentStepId);
    if (posInShared === -1 || posInShared >= stepsBeforeBranch.value.length - 1) return null;
    return stepsBeforeBranch.value[posInShared + 1]?.id ?? null;
  }

  /**
   * Navigate UP from a step
   *
   * Rules:
   * - In shared: previous shared step (or null if at first)
   * - In branch at first step: exit to branch point
   * - In branch: previous step in same branch
   * - No branching: simple linear navigation
   */
  function getPrevStepId(currentStepId: string): string | null {
    // No branching: simple linear navigation
    if (!isBranchingEnabled.value) {
      const currentIndex = steps.value.findIndex((s) => s.id === currentStepId);
      if (currentIndex <= 0) return null;
      return steps.value[currentIndex - 1]?.id ?? null;
    }

    // In a branch
    const flow = getStepFlow(currentStepId);
    if (flow === 'testimonial' || flow === 'improvement') {
      const branchSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
      const posInBranch = findPositionInFlow(branchSteps, currentStepId);

      // At first step of branch: exit to branch point
      if (posInBranch === 0) {
        return getBranchPointStepId();
      }

      // Navigate within branch
      if (posInBranch > 0) {
        return branchSteps[posInBranch - 1]?.id ?? null;
      }

      return null;
    }

    // In shared steps: navigate to previous shared step
    const posInShared = findPositionInFlow(stepsBeforeBranch.value, currentStepId);
    if (posInShared <= 0) return null;
    return stepsBeforeBranch.value[posInShared - 1]?.id ?? null;
  }

  /**
   * Navigate LEFT/RIGHT to parallel branch
   *
   * Rules:
   * - At branch point: enter the specified branch
   * - In testimonial: switch to improvement at same position
   * - In improvement: switch to testimonial at same position
   * - In shared: no effect
   */
  function getParallelStepId(currentStepId: string): string | null {
    if (!isBranchingEnabled.value) return null;

    // At branch point: no parallel (handled by specific left/right methods)
    if (isAtBranchPoint(currentStepId)) return null;

    const flow = getStepFlow(currentStepId);

    if (flow === 'testimonial') {
      // Switch to improvement at same position
      const posInBranch = findPositionInFlow(testimonialSteps.value, currentStepId);
      if (posInBranch === -1) return null;
      // Clamp to improvement branch length
      const targetPos = Math.min(posInBranch, improvementSteps.value.length - 1);
      return improvementSteps.value[targetPos]?.id ?? null;
    }

    if (flow === 'improvement') {
      // Switch to testimonial at same position
      const posInBranch = findPositionInFlow(improvementSteps.value, currentStepId);
      if (posInBranch === -1) return null;
      // Clamp to testimonial branch length
      const targetPos = Math.min(posInBranch, testimonialSteps.value.length - 1);
      return testimonialSteps.value[targetPos]?.id ?? null;
    }

    // In shared: no parallel
    return null;
  }

  return {
    getNextStepId,
    getPrevStepId,
    getParallelStepId,
    getStepFlow,
    isAtBranchPoint,
    isInBranch,
    getBranchEntryStepId,
    getBranchPointStepId,
  };
}
