import { ref, computed, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { FormStep } from '../../models/stepContent';

export function useStepNavigation(steps: Ref<FormStep[]>) {
  const route = useRoute();
  const router = useRouter();

  const selectedIndex = ref(0);

  const selectedStep = computed(() => {
    return steps.value[selectedIndex.value] ?? null;
  });

  const canGoNext = computed(() => {
    return selectedIndex.value < steps.value.length - 1;
  });

  const canGoPrev = computed(() => {
    return selectedIndex.value > 0;
  });

  function selectStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      selectedIndex.value = index;
      syncToUrl();
    }
  }

  function selectStepById(id: string) {
    const index = steps.value.findIndex(s => s.id === id);
    if (index !== -1) {
      selectStep(index);
    }
  }

  function goNext() {
    if (canGoNext.value) {
      selectStep(selectedIndex.value + 1);
    }
  }

  function goPrev() {
    if (canGoPrev.value) {
      selectStep(selectedIndex.value - 1);
    }
  }

  function scrollToStep(index: number) {
    const element = document.querySelector(`[data-step-index="${index}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // URL sync
  function syncToUrl() {
    const step = steps.value[selectedIndex.value];
    if (step) {
      router.replace({ query: { ...route.query, step: step.id } });
    }
  }

  function syncFromUrl() {
    const stepId = route.query.step as string;
    if (stepId) {
      selectStepById(stepId);
    }
  }

  // Initialize from URL
  watch(() => steps.value.length, () => {
    if (steps.value.length > 0) {
      syncFromUrl();
    }
  }, { immediate: true });

  return {
    selectedIndex,
    selectedStep,
    canGoNext,
    canGoPrev,
    selectStep,
    selectStepById,
    goNext,
    goPrev,
    scrollToStep,
  };
}
