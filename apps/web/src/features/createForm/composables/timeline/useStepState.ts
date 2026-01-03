import { ref, computed } from 'vue';
import type { FormStep } from '../../models/stepContent';

export function useStepState() {
  const steps = ref<FormStep[]>([]);
  const originalSteps = ref<FormStep[]>([]);

  const isDirty = computed(() => {
    return JSON.stringify(steps.value) !== JSON.stringify(originalSteps.value);
  });

  const hasSteps = computed(() => steps.value.length > 0);

  function setSteps(newSteps: FormStep[]) {
    steps.value = [...newSteps];
    originalSteps.value = JSON.parse(JSON.stringify(newSteps));
  }

  function markClean() {
    originalSteps.value = JSON.parse(JSON.stringify(steps.value));
  }

  function getStepById(id: string): FormStep | undefined {
    return steps.value.find(s => s.id === id);
  }

  function getStepByIndex(index: number): FormStep | undefined {
    return steps.value[index];
  }

  return {
    steps,
    isDirty,
    hasSteps,
    setSteps,
    markClean,
    getStepById,
    getStepByIndex,
  };
}
