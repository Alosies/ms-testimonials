import { ref, computed, type Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';

/**
 * Composable for managing the public form flow state
 * Handles step navigation and response collection
 *
 * @param steps - Reactive ref of form steps (reacts to changes)
 */
export function usePublicFormFlow(steps: Ref<FormStep[]>) {
  const currentStepIndex = ref(0);
  const responses = ref<Record<string, unknown>>({});

  const currentStep = computed(() => steps.value[currentStepIndex.value] ?? null);
  const isFirstStep = computed(() => currentStepIndex.value === 0);
  const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);
  const progress = computed(() => ((currentStepIndex.value + 1) / steps.value.length) * 100);

  function goToNext() {
    if (currentStepIndex.value < steps.value.length - 1) {
      currentStepIndex.value++;
    }
  }

  function goToPrevious() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--;
    }
  }

  function goToStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
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
