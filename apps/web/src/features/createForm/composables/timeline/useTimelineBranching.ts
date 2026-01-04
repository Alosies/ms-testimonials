/**
 * Timeline Branching - Branching state and operations
 *
 * Handles conditional flow branching based on rating threshold.
 * Extracted from useTimelineEditor for maintainability.
 */
import { ref, computed, type Ref } from 'vue';
import type { FormStep, StepType, FlowMembership } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';
import { DEFAULT_BRANCHING_CONFIG } from '@/entities/form';
import { generateTempId, reorderSteps } from './useStepOperations';

interface BranchingDeps {
  steps: Ref<FormStep[]>;
  formId: Ref<string | null>;
  selectStepById: (id: string) => void;
}

export function useTimelineBranching(deps: BranchingDeps) {
  const { steps, formId, selectStepById } = deps;

  // ============================================
  // State
  // ============================================
  const branchingConfig = ref<BranchingConfig>({ ...DEFAULT_BRANCHING_CONFIG });
  const currentFlowFocus = ref<'testimonial' | 'improvement' | null>(null);
  const expandedFlow = ref<'testimonial' | 'improvement' | null>(null);

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

    // Mark steps before rating as shared, after as testimonial
    steps.value.forEach((step, index) => {
      if (index <= ratingIndex) {
        step.flowMembership = 'shared';
      } else {
        step.flowMembership = 'testimonial';
      }
      step.isModified = true;
    });

    addDefaultImprovementSteps();
  }

  function disableBranching() {
    branchingConfig.value = { ...DEFAULT_BRANCHING_CONFIG };

    // Remove improvement flow steps
    const filtered = steps.value.filter(s => s.flowMembership !== 'improvement');
    steps.value.length = 0;
    steps.value.push(...filtered);

    // Mark all remaining as shared
    steps.value.forEach(step => {
      step.flowMembership = 'shared';
      step.isModified = true;
    });

    reorderSteps(steps.value);
    currentFlowFocus.value = null;
  }

  function setBranchingThreshold(threshold: number) {
    branchingConfig.value.threshold = threshold;
  }

  function addDefaultImprovementSteps() {
    const whatWentWrongStep: FormStep = {
      id: generateTempId(),
      formId: formId.value ?? '',
      stepType: 'question',
      stepOrder: steps.value.length,
      questionId: null,
      content: {},
      tips: ['Be honest - your feedback helps us improve'],
      flowMembership: 'improvement',
      isActive: true,
      isNew: true,
      isModified: false,
    };

    const improvementThankYouStep: FormStep = {
      id: generateTempId(),
      formId: formId.value ?? '',
      stepType: 'thank_you',
      stepOrder: steps.value.length + 1,
      questionId: null,
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

    const newStep: FormStep = {
      id: generateTempId(),
      formId: formId.value ?? '',
      stepType: type,
      stepOrder: steps.value.length,
      questionId: null,
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

  function focusFlow(flow: 'testimonial' | 'improvement') {
    currentFlowFocus.value = flow;
    const flowSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
    if (flowSteps.length > 0) {
      selectStepById(flowSteps[0].id);
    }
  }

  function switchFlow() {
    if (currentFlowFocus.value === 'testimonial') {
      focusFlow('improvement');
    } else if (currentFlowFocus.value === 'improvement') {
      focusFlow('testimonial');
    }
  }

  function expandCurrentFlow() {
    if (currentFlowFocus.value) {
      expandedFlow.value = currentFlowFocus.value;
    }
  }

  function collapseFlow() {
    expandedFlow.value = null;
  }

  function setExpandedFlow(flow: 'testimonial' | 'improvement' | null) {
    expandedFlow.value = flow;
    if (flow) {
      focusFlow(flow);
    }
  }

  return {
    // State
    branchingConfig,
    currentFlowFocus,
    expandedFlow,

    // Computed
    isBranchingEnabled,
    sharedSteps,
    testimonialSteps,
    improvementSteps,
    branchPointIndex,
    branchPointStep,
    stepsBeforeBranch,

    // Operations
    setBranchingConfig,
    enableBranching,
    disableBranching,
    setBranchingThreshold,
    addStepToFlow,
    focusFlow,
    switchFlow,
    expandCurrentFlow,
    collapseFlow,
    setExpandedFlow,
  };
}
