/**
 * Types for DisableBranchingModal widget
 */

/**
 * User's choice when disabling branching
 */
export type DisableBranchingChoice =
  | 'keep-testimonial'
  | 'keep-improvement'
  | 'delete-all'
  | 'cancel';

/**
 * Context information about the current branching state
 */
export interface DisableBranchingContext {
  testimonialStepCount: number;
  improvementStepCount: number;
}

/**
 * Options for showing the disable branching modal
 */
export interface DisableBranchingOptions {
  context: DisableBranchingContext;
  onChoice: (choice: DisableBranchingChoice) => void | Promise<void>;
}

/**
 * Internal modal state
 */
export interface DisableBranchingModalState {
  visible: boolean;
  context: DisableBranchingContext;
  selectedChoice: DisableBranchingChoice | null;
  isLoading: boolean;
  onChoice: ((choice: DisableBranchingChoice) => void | Promise<void>) | null;
}
