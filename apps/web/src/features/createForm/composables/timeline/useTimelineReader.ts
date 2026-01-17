/**
 * Timeline Reader - Read-only interface for timeline state
 *
 * ADR-014 Phase 3: Interface Segregation Principle (ISP) compliance.
 *
 * Use this in components that only need to display timeline data,
 * not modify it. This provides type safety guaranteeing the component
 * cannot accidentally mutate state.
 *
 * @deprecated This Phase 3 composable wraps the legacy useTimelineEditor.
 * In Phase 7, it should be refactored to compose from Phase 5 singletons directly:
 * - useTimelineState for core state
 * - useTimelineComputed for derived computations
 *
 * TODO (Phase 7): Refactor to compose from Phase 5 singletons directly.
 *
 * @example
 * ```ts
 * // In StepPreview.vue
 * const { currentStep, designConfig, steps } = useTimelineReader();
 * ```
 */
import { computed, type ComputedRef, type DeepReadonly } from 'vue';
import { useTimelineEditor } from './useTimelineEditor';
import type { FormStep } from '@/entities/formStep';
import type { BranchingConfig, FormDesignConfig } from '@/entities/form';

/**
 * Read-only interface for timeline state.
 * All state is returned as DeepReadonly or ComputedRef to prevent mutations.
 */
export interface TimelineReader {
  /** All steps in display order (read-only) */
  steps: DeepReadonly<ComputedRef<readonly FormStep[]>>;

  /** Currently selected step (read-only) */
  currentStep: DeepReadonly<ComputedRef<FormStep | null>>;

  /** Index of selected step */
  selectedIndex: ComputedRef<number>;

  /** Current branching configuration (read-only) */
  branchingConfig: DeepReadonly<ComputedRef<BranchingConfig>>;

  /** Design configuration (read-only) */
  designConfig: DeepReadonly<ComputedRef<FormDesignConfig>>;

  /** Whether branching is enabled */
  isBranchingEnabled: ComputedRef<boolean>;

  /** Whether form has unsaved changes */
  isDirty: ComputedRef<boolean>;

  /** Steps filtered by flow membership */
  sharedSteps: ComputedRef<readonly FormStep[]>;
  testimonialSteps: ComputedRef<readonly FormStep[]>;
  improvementSteps: ComputedRef<readonly FormStep[]>;

  /** The step serving as branch point (rating step) */
  branchPointStep: ComputedRef<FormStep | null>;

  /** Whether there are any steps */
  hasSteps: ComputedRef<boolean>;

  /** Effective primary color (custom or org default) */
  effectivePrimaryColor: ComputedRef<string>;

  /** Effective logo URL (custom or org default) */
  effectiveLogo: ComputedRef<string | null>;
}

/**
 * Read-only access to timeline state.
 *
 * Use this in components that only need to display data, not modify it.
 * This provides type safety guaranteeing the component cannot accidentally mutate state.
 */
export function useTimelineReader(): TimelineReader {
  const editor = useTimelineEditor();

  return {
    // Core state - wrap in computed to ensure readonly
    steps: computed(() => editor.steps.value),
    currentStep: computed(() => editor.selectedStep.value),
    selectedIndex: computed(() => editor.selectedIndex.value),

    // Branching config
    branchingConfig: computed(() => editor.branchingConfig.value),
    isBranchingEnabled: computed(() => editor.isBranchingEnabled.value),

    // Design config
    designConfig: computed(() => editor.designConfig.value),
    effectivePrimaryColor: computed(() => editor.effectivePrimaryColor.value),
    effectiveLogo: computed(() => editor.effectiveLogo.value),

    // Dirty state
    isDirty: computed(() => editor.isDirty.value),

    // Flow-filtered steps
    sharedSteps: computed(() => editor.sharedSteps.value),
    testimonialSteps: computed(() => editor.testimonialSteps.value),
    improvementSteps: computed(() => editor.improvementSteps.value),

    // Branch point
    branchPointStep: computed(() => editor.branchPointStep.value),

    // Has steps
    hasSteps: computed(() => editor.hasSteps.value),
  };
}
