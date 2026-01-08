/**
 * Branching Flow Focus - UI state for flow focus and expansion
 *
 * Extracted from useTimelineBranching for maintainability.
 * Manages which flow is focused and expanded in the UI.
 */
import { ref, type ComputedRef } from 'vue';
import type { FormStep } from '@/shared/stepCards';

interface BranchingFlowFocusDeps {
  testimonialSteps: ComputedRef<FormStep[]>;
  improvementSteps: ComputedRef<FormStep[]>;
  selectStepById: (id: string) => void;
}

export function useBranchingFlowFocus(deps: BranchingFlowFocusDeps) {
  const { testimonialSteps, improvementSteps, selectStepById } = deps;

  // ============================================
  // State
  // ============================================
  const currentFlowFocus = ref<'testimonial' | 'improvement' | null>(null);
  const expandedFlow = ref<'testimonial' | 'improvement' | null>(null);

  // ============================================
  // Operations
  // ============================================

  /**
   * Set flow focus AND select the first step of that flow.
   * Used for UI buttons/interactions that want to jump to a flow.
   */
  function focusFlow(flow: 'testimonial' | 'improvement') {
    currentFlowFocus.value = flow;
    const flowSteps = flow === 'testimonial' ? testimonialSteps.value : improvementSteps.value;
    if (flowSteps.length > 0) {
      selectStepById(flowSteps[0].id);
    }
  }

  /**
   * Set flow focus WITHOUT selecting a step.
   * Used for keyboard navigation where selection is handled separately.
   */
  function setFlowFocus(flow: 'testimonial' | 'improvement' | null) {
    currentFlowFocus.value = flow;
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
    currentFlowFocus,
    expandedFlow,

    // Operations
    focusFlow,
    setFlowFocus,
    switchFlow,
    expandCurrentFlow,
    collapseFlow,
    setExpandedFlow,
  };
}
