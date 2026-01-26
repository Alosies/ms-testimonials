/**
 * Timeline Branching - Branching state and operations
 *
 * Handles conditional flow branching based on rating threshold.
 * Extracted from useTimelineEditor for maintainability.
 *
 * This composable orchestrates smaller modules:
 * - useBranchingDisable: Disable operations with different retention strategies
 * - useBranchingFlowFocus: Flow focus and expansion UI state
 * - useBranchingDetection: Auto-detect branching from loaded steps
 */
import { ref, computed, type Ref } from 'vue';
import type { FormStep, StepType, FlowMembership } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { DEFAULT_BRANCHING_CONFIG } from '@/entities/form';
import { useClearFlowBranchColumns, useDeleteFlow } from '@/entities/flow';
import { useDeleteFormSteps } from '@/entities/formStep';
import { generateTempId, reorderSteps } from '../../functions/stepOperations';
import { useBranchingDisable } from './useBranchingDisable';
import { useBranchingFlowFocus } from './useBranchingFlowFocus';
import { useBranchingDetection } from './useBranchingDetection';
import { useSaveLock } from '../autoSave';
import type { FlowSegment, SharedSegment, BranchSegment } from '../../functions';

interface BranchingDeps {
  steps: Ref<FormStep[]>;
  originalSteps: Ref<FormStep[]>;
  formId: Ref<string | null>;
  selectStepById: (id: string) => void;
}

/**
 * Check if a step's flowMembership changed from its original value
 */
function hasFlowMembershipChanged(step: FormStep, originalSteps: FormStep[]): boolean {
  const original = originalSteps.find(s => s.id === step.id);
  if (!original) return true; // New step
  return step.flowMembership !== original.flowMembership;
}

export function useTimelineBranching(deps: BranchingDeps) {
  const { steps, originalSteps, formId, selectStepById } = deps;

  // ============================================
  // State
  // ============================================
  const branchingConfig = ref<BranchingConfig>({ ...DEFAULT_BRANCHING_CONFIG });

  // ============================================
  // Computed
  // ============================================
  const isBranchingEnabled = computed(() => branchingConfig.value.enabled);

  const sharedSteps = computed(() =>
    steps.value.filter(s => s.flowMembership === 'shared'),
  );

  const testimonialSteps = computed(() =>
    steps.value.filter(s => s.flowMembership === 'testimonial'),
  );

  const improvementSteps = computed(() =>
    steps.value.filter(s => s.flowMembership === 'improvement'),
  );

  const branchPointIndex = computed(() => {
    if (!branchingConfig.value.enabled || !branchingConfig.value.ratingStepId) {
      return -1;
    }
    return steps.value.findIndex(s => s.id === branchingConfig.value.ratingStepId);
  });

  const branchPointStep = computed(() => {
    const index = branchPointIndex.value;
    return index >= 0 ? steps.value[index] : null;
  });

  const stepsBeforeBranch = computed(() => {
    if (branchPointIndex.value === -1) return steps.value;
    return steps.value.slice(0, branchPointIndex.value + 1);
  });

  /**
   * ADR-018: Compute flow segments for generic canvas rendering.
   *
   * Groups steps into segments based on flowMembership:
   * - Shared segment (intro): Steps before branch point
   * - Branch segment: Testimonial and improvement steps
   * - Shared segment (outro): Steps after branches with flowMembership='shared'
   *
   * This computed provides a generic view for rendering any sequence of
   * shared/branch flows, supporting future patterns like:
   * Shared(intro) → Branch → Shared(outro) → Branch → Shared
   */
  const flowSegments = computed<FlowSegment[]>(() => {
    if (!isBranchingEnabled.value || branchPointIndex.value === -1) {
      // No branching - all steps in a single shared segment
      if (steps.value.length === 0) return [];
      return [{
        type: 'shared',
        flows: [],
        steps: steps.value,
      } as SharedSegment];
    }

    const segments: FlowSegment[] = [];

    // Intro segment: shared steps up to and including branch point
    const introSteps = stepsBeforeBranch.value;
    if (introSteps.length > 0) {
      segments.push({
        type: 'shared',
        flows: [],
        steps: introSteps,
      } as SharedSegment);
    }

    // Branch segment: testimonial and improvement steps
    const testimSteps = testimonialSteps.value;
    const improvSteps = improvementSteps.value;
    if (testimSteps.length > 0 || improvSteps.length > 0) {
      const stepsByFlow = new Map<string, FormStep[]>();
      // Use 'testimonial' and 'improvement' as pseudo-flow IDs for now
      if (testimSteps.length > 0) {
        stepsByFlow.set('testimonial', testimSteps);
      }
      if (improvSteps.length > 0) {
        stepsByFlow.set('improvement', improvSteps);
      }
      segments.push({
        type: 'branch',
        flows: [],
        stepsByFlow,
      } as BranchSegment);
    }

    // Outro segment: shared steps after branches
    // These would be steps with flowMembership='shared' that come after the branch point
    // Currently, the data model doesn't distinguish intro vs outro shared steps,
    // but this is where they would go when ADR-018 is fully implemented
    const outroSteps = steps.value.filter(
      s => s.flowMembership === 'shared' && steps.value.indexOf(s) > branchPointIndex.value
    );
    if (outroSteps.length > 0) {
      segments.push({
        type: 'shared',
        flows: [],
        steps: outroSteps,
      } as SharedSegment);
    }

    return segments;
  });

  /**
   * ADR-018: Check if there's an outro segment (shared steps after branches).
   */
  const hasOutroSegment = computed(() => {
    return flowSegments.value.length > 2 &&
           flowSegments.value[flowSegments.value.length - 1].type === 'shared';
  });

  /**
   * ADR-018: Get the outro segment if it exists.
   */
  const outroSegment = computed<SharedSegment | null>(() => {
    if (!hasOutroSegment.value) return null;
    return flowSegments.value[flowSegments.value.length - 1] as SharedSegment;
  });

  /**
   * ADR-018: Get steps in the outro section.
   */
  const outroSteps = computed(() => {
    return (outroSegment.value?.steps ?? []) as FormStep[];
  });

  // ============================================
  // Compose Sub-Modules
  // ============================================

  // Flow focus and expansion UI state
  const flowFocus = useBranchingFlowFocus({
    testimonialSteps,
    improvementSteps,
    selectStepById,
  });

  // Disable operations (needs currentFlowFocus from flowFocus)
  const disableOps = useBranchingDisable({
    steps,
    originalSteps,
    branchingConfig,
    currentFlowFocus: flowFocus.currentFlowFocus,
  });

  // Detection logic
  const detection = useBranchingDetection({
    branchingConfig,
  });

  // ADR-011: Persistence composables for immediate save
  const { withLock } = useSaveLock();
  const { clearFlowBranchColumns } = useClearFlowBranchColumns();
  const { deleteFormSteps } = useDeleteFormSteps();
  const { deleteFlow } = useDeleteFlow();

  // ============================================
  // Operations
  // ============================================

  function setBranchingConfig(config: BranchingConfig) {
    branchingConfig.value = { ...config };
  }

  function enableBranching(ratingStepId: string, threshold = 4) {
    branchingConfig.value = {
      enabled: true,
      threshold,
      ratingStepId,
    };

    const ratingIndex = steps.value.findIndex(s => s.id === ratingStepId);
    if (ratingIndex === -1) return;

    // Update flowMembership: before rating = shared, after = testimonial
    // Track modification state based on comparison with original
    steps.value.forEach((step, index) => {
      const newMembership = index <= ratingIndex ? 'shared' : 'testimonial';
      if (step.flowMembership !== newMembership) {
        step.flowMembership = newMembership;
      }
      // Update isModified based on whether current state differs from original
      // This handles both setting true when changed AND resetting to false when restored
      step.isModified = hasFlowMembershipChanged(step, originalSteps.value);
    });

    addDefaultImprovementSteps();
  }

  function setBranchingThreshold(threshold: number) {
    branchingConfig.value.threshold = threshold;
  }

  function addDefaultImprovementSteps() {
    // ADR-013: Get improvement flowId from context (should be created when branching is enabled)
    const improvementFlowId = steps.value.find(s => s.flowMembership === 'improvement')?.flowId ?? '';

    const whatWentWrongStep: FormStep = {
      id: generateTempId(),
      // ADR-013: flowId is required, formId removed
      flowId: improvementFlowId,
      stepType: 'question',
      stepOrder: steps.value.length,
      content: {},
      tips: ['Be honest - your feedback helps us improve'],
      flowMembership: 'improvement',
      isActive: true,
      isNew: true,
      isModified: false,
    };

    const improvementThankYouStep: FormStep = {
      id: generateTempId(),
      // ADR-013: flowId is required, formId removed
      flowId: improvementFlowId,
      stepType: 'thank_you',
      stepOrder: steps.value.length + 1,
      content: {
        title: 'Thank you for your feedback',
        message: 'We take your feedback seriously and will work to improve.',
        showSocialShare: false,
      },
      tips: [],
      flowMembership: 'improvement',
      isActive: true,
      isNew: true,
      isModified: false,
    };

    steps.value.push(whatWentWrongStep, improvementThankYouStep);
    reorderSteps(steps.value);
  }

  function addStepToFlow(type: StepType, flow: FlowMembership, afterIndex?: number): FormStep {
    const flowSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
    const insertIndex = afterIndex !== undefined
      ? afterIndex + 1
      : flowSteps.length;

    // ADR-013: Get flowId from existing steps in the same flow
    const existingFlowStep = steps.value.find(s => s.flowMembership === flow);
    const targetFlowId = existingFlowStep?.flowId ?? '';

    const newStep: FormStep = {
      id: generateTempId(),
      // ADR-013: flowId is required, formId removed
      flowId: targetFlowId,
      stepType: type,
      stepOrder: steps.value.length,
      content: {},
      tips: [],
      flowMembership: flow,
      isActive: true,
      isNew: true,
      isModified: false,
    };

    // Calculate position in main array
    let mainArrayIndex: number;
    if (flow === 'testimonial') {
      const lastSharedIndex = branchPointIndex.value;
      mainArrayIndex = lastSharedIndex + 1 + insertIndex;
    } else {
      // Find last testimonial step index (compatible with ES2022)
      let lastTestimonialIndex = -1;
      for (let i = steps.value.length - 1; i >= 0; i--) {
        if (steps.value[i].flowMembership === 'testimonial') {
          lastTestimonialIndex = i;
          break;
        }
      }
      const baseIndex = lastTestimonialIndex >= 0 ? lastTestimonialIndex + 1 : branchPointIndex.value + 1;
      mainArrayIndex = baseIndex + insertIndex;
    }

    steps.value.splice(mainArrayIndex, 0, newStep);
    reorderSteps(steps.value);

    return newStep;
  }

  // ============================================
  // ADR-011: Persistence Methods for Immediate Save
  // ============================================

  /**
   * Helper to get step IDs to delete based on flow membership filter.
   * Only returns IDs for steps that exist in the database (non-temp).
   */
  function getStepIdsToDelete(filter: (s: FormStep) => boolean): string[] {
    return steps.value
      .filter(filter)
      .filter(s => !s.id.startsWith('temp_'))
      .map(s => s.id);
  }

  /**
   * Helper to get flow IDs to delete based on flow type.
   * Returns unique flow IDs for steps that match the filter.
   */
  function getFlowIdsToDelete(flowMemberships: FlowMembership[]): string[] {
    const flowIds = new Set<string>();
    steps.value.forEach(s => {
      if (flowMemberships.includes(s.flowMembership) && s.flowId) {
        flowIds.add(s.flowId);
      }
    });
    return [...flowIds];
  }

  /**
   * Disable branching and delete all branched steps with immediate persistence.
   * ADR-011: Immediate save for discrete actions.
   *
   * Steps:
   * 1. Clear branch_question_id on flows (prevents FK violation)
   * 2. Delete branched steps from database
   * 3. Delete empty flows (testimonial and improvement)
   * 4. Update local state
   */
  async function disableBranchingDeleteAllWithPersist(): Promise<void> {
    return withLock('disable-branching', async () => {
      const currentFormId = formId.value;
      if (!currentFormId) {
        throw new Error('Cannot disable branching: missing formId');
      }

      // Get IDs before modifying local state
      const stepIdsToDelete = getStepIdsToDelete(
        s => s.flowMembership === 'testimonial' || s.flowMembership === 'improvement',
      );
      const flowIdsToDelete = getFlowIdsToDelete(['testimonial', 'improvement']);

      // 1. Clear branch columns from all flows (prevents FK violation)
      await clearFlowBranchColumns(currentFormId);

      // 2. Delete branched steps from database
      if (stepIdsToDelete.length > 0) {
        await deleteFormSteps({ ids: stepIdsToDelete });
      }

      // 3. Delete empty flows (testimonial and improvement)
      for (const flowId of flowIdsToDelete) {
        try {
          await deleteFlow({ flowId });
        } catch (err) {
          // Log but continue - flow deletion is not critical
          console.error('Failed to delete flow:', flowId, err);
        }
      }

      // 4. Update local state
      disableOps.disableBranchingDeleteAll();
    });
  }

  /**
   * Disable branching, keep testimonial steps with immediate persistence.
   * ADR-011: Immediate save for discrete actions.
   */
  async function disableBranchingKeepTestimonialWithPersist(): Promise<void> {
    return withLock('disable-branching', async () => {
      const currentFormId = formId.value;
      if (!currentFormId) {
        throw new Error('Cannot disable branching: missing formId');
      }

      // Get improvement step IDs and flow IDs before modifying local state
      const stepIdsToDelete = getStepIdsToDelete(s => s.flowMembership === 'improvement');
      const flowIdsToDelete = getFlowIdsToDelete(['improvement']);

      // 1. Clear branch columns from all flows
      await clearFlowBranchColumns(currentFormId);

      // 2. Delete improvement steps from database
      if (stepIdsToDelete.length > 0) {
        await deleteFormSteps({ ids: stepIdsToDelete });
      }

      // 3. Delete improvement flow
      for (const flowId of flowIdsToDelete) {
        try {
          await deleteFlow({ flowId });
        } catch (err) {
          console.error('Failed to delete flow:', flowId, err);
        }
      }

      // 4. Update local state
      disableOps.disableBranchingKeepTestimonial();
    });
  }

  /**
   * Disable branching, keep improvement steps with immediate persistence.
   * ADR-011: Immediate save for discrete actions.
   */
  async function disableBranchingKeepImprovementWithPersist(): Promise<void> {
    return withLock('disable-branching', async () => {
      const currentFormId = formId.value;
      if (!currentFormId) {
        throw new Error('Cannot disable branching: missing formId');
      }

      // Get testimonial step IDs and flow IDs before modifying local state
      const stepIdsToDelete = getStepIdsToDelete(s => s.flowMembership === 'testimonial');
      const flowIdsToDelete = getFlowIdsToDelete(['testimonial']);

      // 1. Clear branch columns from all flows
      await clearFlowBranchColumns(currentFormId);

      // 2. Delete testimonial steps from database
      if (stepIdsToDelete.length > 0) {
        await deleteFormSteps({ ids: stepIdsToDelete });
      }

      // 3. Delete testimonial flow
      for (const flowId of flowIdsToDelete) {
        try {
          await deleteFlow({ flowId });
        } catch (err) {
          console.error('Failed to delete flow:', flowId, err);
        }
      }

      // 4. Update local state
      disableOps.disableBranchingKeepImprovement();
    });
  }

  return {
    // State
    branchingConfig,
    currentFlowFocus: flowFocus.currentFlowFocus,
    expandedFlow: flowFocus.expandedFlow,

    // Computed
    isBranchingEnabled,
    sharedSteps,
    testimonialSteps,
    improvementSteps,
    branchPointIndex,
    branchPointStep,
    stepsBeforeBranch,
    // ADR-018: Flow segments
    flowSegments,
    hasOutroSegment,
    outroSegment,
    outroSteps,

    // Operations
    setBranchingConfig,
    enableBranching,
    disableBranching: disableOps.disableBranching,
    disableBranchingKeepTestimonial: disableOps.disableBranchingKeepTestimonial,
    disableBranchingKeepImprovement: disableOps.disableBranchingKeepImprovement,
    disableBranchingDeleteAll: disableOps.disableBranchingDeleteAll,
    // ADR-011: Persistence methods for immediate save
    disableBranchingDeleteAllWithPersist,
    disableBranchingKeepTestimonialWithPersist,
    disableBranchingKeepImprovementWithPersist,
    setBranchingThreshold,
    addStepToFlow,
    focusFlow: flowFocus.focusFlow,
    setFlowFocus: flowFocus.setFlowFocus,
    switchFlow: flowFocus.switchFlow,
    expandCurrentFlow: flowFocus.expandCurrentFlow,
    collapseFlow: flowFocus.collapseFlow,
    setExpandedFlow: flowFocus.setExpandedFlow,
    detectBranchingFromSteps: detection.detectBranchingFromSteps,
  };
}
