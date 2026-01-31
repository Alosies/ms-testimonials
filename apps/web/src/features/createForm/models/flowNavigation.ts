/**
 * Flow Navigation Types
 *
 * Types for branch-aware navigation in the form studio.
 */
import type { ComputedRef, Ref } from 'vue';

/**
 * Minimal step interface for flow navigation
 */
export interface FlowStep {
  id: string;
  flowMembership?: string;
}

/**
 * Dependencies for useFlowNavigation composable
 */
export interface FlowNavigationDeps {
  /** All steps in the form (flat array) */
  steps: Ref<readonly FlowStep[]>;

  /** Steps before and including the branch point */
  stepsBeforeBranch: ComputedRef<readonly FlowStep[]>;

  /** Steps in testimonial flow */
  testimonialSteps: ComputedRef<readonly FlowStep[]>;

  /** Steps in improvement flow */
  improvementSteps: ComputedRef<readonly FlowStep[]>;

  /** ADR-018: Steps in outro section (shared steps after branches) */
  outroSteps: ComputedRef<readonly FlowStep[]>;

  /** Whether branching is enabled */
  isBranchingEnabled: ComputedRef<boolean>;

  /** Index of the branch point in the main steps array */
  branchPointIndex: ComputedRef<number>;
}

/**
 * Result interface for useFlowNavigation composable
 */
export interface FlowNavigationResult {
  /** Get the step ID after navigating down from the given step */
  getNextStepId: (currentStepId: string) => string | null;

  /** Get the step ID after navigating up from the given step */
  getPrevStepId: (currentStepId: string) => string | null;

  /** Get the parallel step ID in the other branch (same position) */
  getParallelStepId: (currentStepId: string) => string | null;

  /** Get which flow a step belongs to */
  getStepFlow: (stepId: string) => 'shared' | 'testimonial' | 'improvement' | null;

  /** Check if a step is at the branch point */
  isAtBranchPoint: (stepId: string) => boolean;

  /** Check if a step is in a branch (testimonial or improvement) */
  isInBranch: (stepId: string) => boolean;

  /** Check if a step is in the outro section */
  isInOutro: (stepId: string) => boolean;

  /** Get the first step of a specific branch */
  getBranchEntryStepId: (branch: 'testimonial' | 'improvement') => string | null;

  /** Get the last step of a specific branch */
  getLastBranchStepId: (branch: 'testimonial' | 'improvement') => string | null;

  /** Get the branch point step ID */
  getBranchPointStepId: () => string | null;
}

/**
 * Dependencies for useBranchedKeyboardNavigation composable
 */
export interface BranchedNavigationDeps {
  // Step data (readonly)
  steps: Ref<readonly FlowStep[]>;
  selectedStepId: ComputedRef<string | null>;

  // Branching computed values
  isBranchingEnabled: ComputedRef<boolean>;
  branchPointIndex: ComputedRef<number>;
  stepsBeforeBranch: ComputedRef<readonly FlowStep[]>;
  testimonialSteps: ComputedRef<readonly FlowStep[]>;
  improvementSteps: ComputedRef<readonly FlowStep[]>;
  /** ADR-018: Steps in outro section (shared steps after branches) */
  outroSteps: ComputedRef<readonly FlowStep[]>;

  // Flow focus state (remembered branch for navigation back from outro)
  currentFlowFocus: Ref<'testimonial' | 'improvement' | null> | ComputedRef<'testimonial' | 'improvement' | null>;

  // Actions
  selectStepById: (id: string) => void;
  setFlowFocus: (flow: 'testimonial' | 'improvement' | null) => void;

  // Optional action callbacks for keyboard shortcuts
  /** Called when E key is pressed on selected step */
  onEditStep?: (index: number) => void;
  /** Called when D or Backspace key is pressed on selected step */
  onRemoveStep?: (index: number) => void;

  /**
   * Called to suppress scroll detection temporarily.
   * Used when switching branches to prevent scroll detection
   * from overriding the keyboard selection.
   */
  suppressScrollDetection?: () => void;
}

/**
 * Result interface for useBranchedKeyboardNavigation composable
 */
export interface BranchedNavigationResult {
  /** Current flow of the selected step */
  currentFlow: ComputedRef<'shared' | 'testimonial' | 'improvement' | null>;

  /** Whether the selected step is at the branch point */
  isAtBranchPoint: ComputedRef<boolean>;

  /** Whether the selected step is in a branch */
  isInBranch: ComputedRef<boolean>;

  /** Flow navigation methods (for direct use if needed) */
  flowNav: FlowNavigationResult;
}
