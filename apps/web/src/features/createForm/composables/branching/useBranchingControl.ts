/**
 * Branching Control - Branch management operations
 *
 * ADR-014 Phase 3: Interface Segregation Principle (ISP) compliance.
 *
 * Use this in components that need to manage conditional branching,
 * such as the BranchingPanel or branching configuration UI.
 *
 * @example
 * ```ts
 * // In BranchingPanel.vue
 * const { branchingConfig, isBranchingEnabled, enableBranching } = useBranchingControl();
 * ```
 */
import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import { useTimelineEditor } from '../timeline/useTimelineEditor';
import type { FormStep, StepType, FlowMembership } from '@/entities/formStep';
import type { BranchingConfig } from '@/entities/form';

/** Branch flow type (excludes 'shared' which is not a branch) */
type BranchFlow = 'testimonial' | 'improvement';

/**
 * Branching control interface for branch management.
 */
export interface BranchingControl {
  /** Current branching configuration (read-only) */
  branchingConfig: ComputedRef<BranchingConfig>;

  /** Whether branching is currently enabled */
  isBranchingEnabled: ComputedRef<boolean>;

  /** The step serving as branch point */
  branchPointStep: ComputedRef<FormStep | null>;

  /** Index of the branch point step */
  branchPointIndex: ComputedRef<number>;

  /** Steps in testimonial branch */
  testimonialSteps: ComputedRef<FormStep[]>;

  /** Steps in improvement branch */
  improvementSteps: ComputedRef<FormStep[]>;

  /** Steps before branch point */
  stepsBeforeBranch: ComputedRef<FormStep[]>;

  /** Currently focused flow for UI highlighting */
  currentFlowFocus: ComputedRef<BranchFlow | null>;

  /** Currently expanded flow */
  expandedFlow: ComputedRef<BranchFlow | null>;

  /** Enable branching with rating step ID and optional threshold */
  enableBranching: (ratingStepId: string, threshold?: number) => void;

  /** Disable branching (local state only) */
  disableBranching: () => void;

  /** Disable branching and delete all branch steps (with persistence) */
  disableBranchingDeleteAllWithPersist: () => Promise<void>;

  /** Disable branching keeping testimonial steps (with persistence) */
  disableBranchingKeepTestimonialWithPersist: () => Promise<void>;

  /** Disable branching keeping improvement steps (with persistence) */
  disableBranchingKeepImprovementWithPersist: () => Promise<void>;

  /** Set branching threshold */
  setBranchingThreshold: (threshold: number) => void;

  /** Set branching configuration */
  setBranchingConfig: (config: BranchingConfig) => void;

  /** Set flow focus for UI highlighting (without selecting step) */
  setFlowFocus: (flow: BranchFlow | null) => void;

  /** Focus a specific flow (sets focus AND selects first step) */
  focusFlow: (flow: BranchFlow) => void;

  /** Switch between testimonial and improvement flows */
  switchFlow: () => void;

  /** Expand current flow */
  expandCurrentFlow: () => void;

  /** Collapse flow */
  collapseFlow: () => void;

  /** Set expanded flow */
  setExpandedFlow: (flow: BranchFlow | null) => void;

  /** Add step to a specific flow */
  addStepToFlow: (type: StepType, flow: FlowMembership, afterIndex?: number) => FormStep;
}

/**
 * Branching operations for branch management UI.
 *
 * Use this in components that need to manage conditional branching.
 */
export function useBranchingControl(): BranchingControl {
  const editor = useTimelineEditor();

  return {
    // Read-only state
    branchingConfig: computed(() => editor.branchingConfig.value),
    isBranchingEnabled: computed(() => editor.isBranchingEnabled.value),
    branchPointStep: computed(() => editor.branchPointStep.value),
    branchPointIndex: computed(() => editor.branchPointIndex.value),
    testimonialSteps: computed(() => editor.testimonialSteps.value),
    improvementSteps: computed(() => editor.improvementSteps.value),
    stepsBeforeBranch: computed(() => editor.stepsBeforeBranch.value),
    currentFlowFocus: computed(() => editor.currentFlowFocus.value),
    expandedFlow: computed(() => editor.expandedFlow.value),

    // Branching operations
    enableBranching: editor.enableBranching,
    disableBranching: editor.disableBranching,
    disableBranchingDeleteAllWithPersist: editor.disableBranchingDeleteAllWithPersist,
    disableBranchingKeepTestimonialWithPersist: editor.disableBranchingKeepTestimonialWithPersist,
    disableBranchingKeepImprovementWithPersist: editor.disableBranchingKeepImprovementWithPersist,
    setBranchingThreshold: editor.setBranchingThreshold,
    setBranchingConfig: editor.setBranchingConfig,

    // Flow focus operations
    setFlowFocus: editor.setFlowFocus,
    focusFlow: editor.focusFlow,
    switchFlow: editor.switchFlow,
    expandCurrentFlow: editor.expandCurrentFlow,
    collapseFlow: editor.collapseFlow,
    setExpandedFlow: editor.setExpandedFlow,

    // Add step to flow
    addStepToFlow: editor.addStepToFlow,
  };
}
