import { ref, computed, type Ref } from 'vue';
import type { FormStep, FlowMembership } from '@/shared/stepCards';
import type { BranchingConfig } from '@/entities/form';

/**
 * Options for the public form flow composable
 */
export interface UsePublicFormFlowOptions {
  steps: Ref<FormStep[]>;
  branchingConfig?: Ref<BranchingConfig | null>;
}

/**
 * Composable for managing the public form flow state
 * Handles step navigation, response collection, and conditional branching
 *
 * @param options - Configuration including steps and optional branching config
 */
export function usePublicFormFlow(options: UsePublicFormFlowOptions) {
  const { steps, branchingConfig } = options;

  const currentStepIndex = ref(0);
  const responses = ref<Record<string, unknown>>({});

  // Track the determined flow after rating step
  const determinedFlow = ref<FlowMembership | null>(null);

  // Check if branching is enabled
  const isBranchingEnabled = computed(() =>
    branchingConfig?.value?.enabled ?? false,
  );

  // Get the rating step ID from branching config
  const ratingStepId = computed(() =>
    branchingConfig?.value?.ratingStepId ?? null,
  );

  // Get the threshold for determining flow
  const threshold = computed(() =>
    branchingConfig?.value?.threshold ?? 4,
  );

  /**
   * Compute visible steps based on branching state
   * - Before rating: show shared steps only (up to and including rating)
   * - After rating: show shared + determined flow steps
   */
  const visibleSteps = computed((): FormStep[] => {
    if (!isBranchingEnabled.value) {
      return steps.value;
    }

    // Find rating step index
    const ratingIndex = steps.value.findIndex(s => s.id === ratingStepId.value);
    if (ratingIndex === -1) {
      // No rating step found, show all steps
      return steps.value;
    }

    // If flow not determined yet, show steps up to and including rating
    if (determinedFlow.value === null) {
      return steps.value.filter((step, index) => {
        // Include all shared steps up to rating
        if (index <= ratingIndex) {
          return step.flowMembership === 'shared';
        }
        return false;
      });
    }

    // Flow determined - show shared + flow-specific steps
    return steps.value.filter((step) => {
      if (step.flowMembership === 'shared') return true;
      return step.flowMembership === determinedFlow.value;
    });
  });

  const currentStep = computed(() => visibleSteps.value[currentStepIndex.value] ?? null);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === visibleSteps.value.length - 1);
  const progress = computed(() => ((currentStepIndex.value + 1) / visibleSteps.value.length) * 100);

  /**
   * Determine which flow to take based on rating value
   */
  function determineFlowFromRating(rating: number) {
    if (rating >= threshold.value) {
      determinedFlow.value = 'testimonial';
    } else {
      determinedFlow.value = 'improvement';
    }
  }

  /**
   * Check if we just completed the rating step and should determine flow
   */
  function checkAndDetermineFlow() {
    if (!isBranchingEnabled.value) return;
    if (determinedFlow.value !== null) return; // Already determined

    const current = currentStep.value;
    if (!current) return;

    // Check if current step is the rating step
    if (current.id === ratingStepId.value) {
      const ratingValue = responses.value[current.id];
      if (typeof ratingValue === 'number') {
        determineFlowFromRating(ratingValue);
      }
    }
  }

  function goToNext() {
    // Check if we need to determine flow before moving on
    checkAndDetermineFlow();

    if (currentStepIndex.value < visibleSteps.value.length - 1) {
      currentStepIndex.value++;
    }
  }

  function goToPrevious() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
    }
  }

  function goToStep(index: number) {
    if (index >= 0 && index < visibleSteps.value.length) {
      currentStepIndex.value = index;
    }
  }

  function setResponse(stepId: string, value: unknown) {
    responses.value[stepId] = value;
  }

  function getResponse(stepId: string) {
    return responses.value[stepId];
  }

  return {
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    responses,
    visibleSteps,
    determinedFlow,
    isBranchingEnabled,
    goToNext,
    goToPrevious,
    goToStep,
    setResponse,
    getResponse,
  };
}
