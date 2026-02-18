/**
 * Step Response Bindings
 *
 * Provides writable computed refs for v-model binding on form step responses.
 * Extracts the getter/setter pattern from PublicFormFlow to keep the component lean.
 */
import { computed, type Ref } from 'vue';
import type { FormStep } from '@/shared/stepCards';

interface UseStepResponseBindingsOptions {
  currentStep: Ref<FormStep | null>;
  getResponse: (stepId: string) => unknown;
  setResponse: (stepId: string, value: unknown) => void;
}

export function useStepResponseBindings({
  currentStep,
  getResponse,
  setResponse,
}: UseStepResponseBindingsOptions) {
  const ratingResponse = computed({
    get: () => {
      const stepId = currentStep.value?.id;
      if (!stepId) return null;
      const value = getResponse(stepId);
      return typeof value === 'number' ? value : null;
    },
    set: (value: number | null) => {
      const stepId = currentStep.value?.id;
      if (stepId && value !== null) {
        setResponse(stepId, value);
      }
    },
  });

  const questionResponse = computed({
    get: () => {
      const stepId = currentStep.value?.id;
      if (!stepId) return '';
      const value = getResponse(stepId);
      return typeof value === 'string' ? value : '';
    },
    set: (value: string) => {
      const stepId = currentStep.value?.id;
      if (stepId) {
        setResponse(stepId, value);
      }
    },
  });

  const testimonialResponse = computed({
    get: () => {
      const stepId = currentStep.value?.id;
      if (!stepId) return '';
      const value = getResponse(stepId);
      return typeof value === 'string' ? value : '';
    },
    set: (value: string) => {
      const stepId = currentStep.value?.id;
      if (stepId) {
        setResponse(stepId, value);
      }
    },
  });

  return { ratingResponse, questionResponse, testimonialResponse };
}
