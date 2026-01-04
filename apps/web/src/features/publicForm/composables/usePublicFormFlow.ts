import { ref, computed } from 'vue';
import type { FormStep } from '@/shared/stepCards';

/**
 * Composable for managing the public form flow state
 * Handles step navigation and response collection
 */
export function usePublicFormFlow(steps: FormStep[]) {
  const currentStepIndex = ref(0);
  const responses = ref<Record<string, unknown>>({});

  const currentStep = computed(() => steps[currentStepIndex.value] ?? null);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === steps.length - 1);
  const progress = computed(() => ((currentStepIndex.value + 1) / steps.length) * 100);

  function goToNext() {
    if (currentStepIndex.value < steps.length - 1) {
      currentStepIndex.value++;
    }
  }

  function goToPrevious() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
    }
  }

  function goToStep(index: number) {
    if (index >= 0 && index < steps.length) {
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
    goToNext,
    goToPrevious,
    goToStep,
    setResponse,
    getResponse,
  };
}
