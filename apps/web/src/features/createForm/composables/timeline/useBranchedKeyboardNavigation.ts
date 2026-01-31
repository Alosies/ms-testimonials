/**
 * Branched Keyboard Navigation
 *
 * Branch-aware keyboard navigation for form studio with conditional flows.
 * Uses useFlowNavigation as the single source of truth for flow structure.
 *
 * NAVIGATION BEHAVIOR:
 *
 * Shared Steps (before branch point):
 * - ArrowDown/j: Navigate to next shared step
 * - ArrowUp/k: Navigate to previous shared step
 * - At last shared step (branch point): Down enters default branch (testimonial)
 *
 * Within a Branch (testimonial or improvement):
 * - ArrowDown/j: Navigate to next step in current branch
 * - ArrowUp/k: Navigate to prev step, OR exit to branch point if at first step
 * - ArrowLeft/h: Switch to testimonial branch (or enter if at branch point)
 * - ArrowRight/l: Switch to improvement branch (or enter if at branch point)
 *
 * The default branch when entering from branch point is 'testimonial'.
 */
import { computed } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { isInputFocused } from '@/shared/composables/scrollSnapNavigation/utils';
import type { BranchedNavigationDeps, BranchedNavigationResult } from '../../models';
import { useFlowNavigation } from './useFlowNavigation';

export function useBranchedKeyboardNavigation(deps: BranchedNavigationDeps): BranchedNavigationResult {
  const {
    steps,
    selectedStepId,
    isBranchingEnabled,
    branchPointIndex,
    stepsBeforeBranch,
    testimonialSteps,
    improvementSteps,
    outroSteps,
    currentFlowFocus,
    selectStepById,
    setFlowFocus,
    onEditStep,
    onRemoveStep,
    suppressScrollDetection,
  } = deps;

  // Initialize flow navigation - single source of truth
  const flowNav = useFlowNavigation({
    steps,
    stepsBeforeBranch,
    testimonialSteps,
    improvementSteps,
    outroSteps,
    isBranchingEnabled,
    branchPointIndex,
  });

  // Current step info computed from flow navigation
  const currentFlow = computed(() => {
    const stepId = selectedStepId.value;
    if (!stepId) return null;
    return flowNav.getStepFlow(stepId);
  });

  const isAtBranchPoint = computed(() => {
    const stepId = selectedStepId.value;
    if (!stepId) return false;
    return flowNav.isAtBranchPoint(stepId);
  });

  const isInBranch = computed(() => {
    const stepId = selectedStepId.value;
    if (!stepId) return false;
    return flowNav.isInBranch(stepId);
  });

  const isInOutro = computed(() => {
    const stepId = selectedStepId.value;
    if (!stepId) return false;
    return flowNav.isInOutro(stepId);
  });

  // Get index of selected step in main steps array
  const selectedIndex = computed(() => {
    const stepId = selectedStepId.value;
    if (!stepId) return -1;
    return steps.value.findIndex(s => s.id === stepId);
  });

  /**
   * Navigate to a step by ID, updating focus flow if entering a branch.
   * Uses setFlowFocus (not focusFlow) to avoid auto-selecting the first step.
   *
   * Suppresses scroll detection to prevent it from overriding the selection
   * with a step from the wrong branch (in side-by-side branch view).
   *
   * NOTE: Flow focus is NOT cleared when entering outro steps, so we remember
   * which branch the user came from and can navigate back to it.
   */
  function navigateToStep(stepId: string | null): void {
    if (!stepId) return;

    // Suppress scroll detection to prevent it from overriding our selection
    // This is critical for branched views where both columns are at similar
    // vertical positions and scroll detection could pick the wrong column.
    suppressScrollDetection?.();

    const flow = flowNav.getStepFlow(stepId);
    if (flow === 'testimonial' || flow === 'improvement') {
      setFlowFocus(flow);
    } else if (!flowNav.isInOutro(stepId)) {
      // Only clear flow focus when navigating to shared INTRO steps (before branch)
      // Keep flow focus when entering outro so we can navigate back to the branch
      setFlowFocus(null);
    }
    selectStepById(stepId);
  }

  /**
   * Handle Down navigation
   */
  function handleKeyDown(e: KeyboardEvent): void {
    if (isInputFocused()) return;

    const currentId = selectedStepId.value;
    if (!currentId) return;

    e.preventDefault();

    const nextId = flowNav.getNextStepId(currentId);
    navigateToStep(nextId);
  }

  /**
   * Handle Up navigation
   *
   * Special case for outro: When at first outro step, navigate to the last
   * step of the remembered branch (from currentFlowFocus), not the branch point.
   */
  function handleKeyUp(e: KeyboardEvent): void {
    if (isInputFocused()) return;

    const currentId = selectedStepId.value;
    if (!currentId) return;

    e.preventDefault();

    // Special handling for first outro step: go back into branch
    if (isInOutro.value && outroSteps.value[0]?.id === currentId) {
      // Use remembered flow focus, default to testimonial if none
      const branch = currentFlowFocus.value ?? 'testimonial';
      const lastBranchStepId = flowNav.getLastBranchStepId(branch);
      if (lastBranchStepId) {
        navigateToStep(lastBranchStepId);
        return;
      }
    }

    const prevId = flowNav.getPrevStepId(currentId);
    navigateToStep(prevId);
  }

  /**
   * Handle Left navigation - Switch to testimonial branch
   */
  function handleKeyLeft(e: KeyboardEvent): void {
    if (isInputFocused()) return;
    if (!isBranchingEnabled.value) return;

    const currentId = selectedStepId.value;
    if (!currentId) return;

    // Only handle if we're in a branch or at branch point
    if (!isInBranch.value && !isAtBranchPoint.value) return;

    e.preventDefault();

    // Suppress scroll detection to prevent it from overriding our selection
    suppressScrollDetection?.();

    // At branch point: enter testimonial
    if (isAtBranchPoint.value) {
      const entryId = flowNav.getBranchEntryStepId('testimonial');
      navigateToStep(entryId);
      return;
    }

    // If already in testimonial, do nothing
    if (currentFlow.value === 'testimonial') return;

    // Switch from improvement to testimonial (parallel position)
    const parallelId = flowNav.getParallelStepId(currentId);
    if (parallelId) {
      setFlowFocus('testimonial');
      selectStepById(parallelId);
    }
  }

  /**
   * Handle Right navigation - Switch to improvement branch
   */
  function handleKeyRight(e: KeyboardEvent): void {
    if (isInputFocused()) return;
    if (!isBranchingEnabled.value) return;

    const currentId = selectedStepId.value;
    if (!currentId) return;

    // Only handle if we're in a branch or at branch point
    if (!isInBranch.value && !isAtBranchPoint.value) return;

    e.preventDefault();

    // Suppress scroll detection to prevent it from overriding our selection
    suppressScrollDetection?.();

    // At branch point: enter improvement
    if (isAtBranchPoint.value) {
      const entryId = flowNav.getBranchEntryStepId('improvement');
      navigateToStep(entryId);
      return;
    }

    // If already in improvement, do nothing
    if (currentFlow.value === 'improvement') return;

    // Switch from testimonial to improvement (parallel position)
    const parallelId = flowNav.getParallelStepId(currentId);
    if (parallelId) {
      setFlowFocus('improvement');
      selectStepById(parallelId);
    }
  }

  /**
   * Handle Edit action (E key)
   */
  function handleKeyEdit(e: KeyboardEvent): void {
    if (isInputFocused()) return;
    if (!onEditStep) return;

    const index = selectedIndex.value;
    if (index === -1) return;

    e.preventDefault();
    onEditStep(index);
  }

  /**
   * Handle Remove/Delete action (Cmd+D or Ctrl+D)
   * Requires modifier key to prevent accidental deletion.
   */
  function handleKeyRemove(e: KeyboardEvent): void {
    if (isInputFocused()) return;
    if (!onRemoveStep) return;

    // Require Cmd (Mac) or Ctrl (Windows/Linux) modifier
    if (!e.metaKey && !e.ctrlKey) return;

    const index = selectedIndex.value;
    if (index === -1) return;

    e.preventDefault();
    onRemoveStep(index);
  }

  // Register keyboard handlers
  onKeyStroke(['ArrowDown', 'j'], handleKeyDown, { eventName: 'keydown' });
  onKeyStroke(['ArrowUp', 'k'], handleKeyUp, { eventName: 'keydown' });
  onKeyStroke(['ArrowLeft', 'h'], handleKeyLeft, { eventName: 'keydown' });
  onKeyStroke(['ArrowRight', 'l'], handleKeyRight, { eventName: 'keydown' });
  onKeyStroke(['e'], handleKeyEdit, { eventName: 'keydown' });
  onKeyStroke(['d'], handleKeyRemove, { eventName: 'keydown' });

  return {
    // Exposed state for debugging/UI
    currentFlow,
    isAtBranchPoint,
    isInBranch,
    // Flow navigation methods (for direct use if needed)
    flowNav,
  };
}
