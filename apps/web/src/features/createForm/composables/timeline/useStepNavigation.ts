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

  /**
   * Scroll to a step element in the timeline canvas.
   *
   * DESIGN DECISION: Uses document.querySelector instead of Vue template refs.
   *
   * Considerations:
   * - Template refs would be more "Vue-idiomatic" and type-safe
   * - However, step elements are rendered by child components (TimelineCanvas)
   *   that this composable doesn't own
   * - Using refs would require prop drilling or provide/inject for ref registration
   * - Data-attribute selector keeps composable loosely coupled from render implementation
   * - Child components only need to add `data-step-index` attribute
   * - SSR is not a concern here (editor requires auth, client-only)
   *
   * If this pattern is needed elsewhere, consider a shared provide/inject pattern
   * for cross-component element registration.
   */
  function scrollToStep(index: number) {
    const element = document.querySelector(`[data-step-index="${index}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ============================================
  // URL State Sync
  // ============================================

  /**
   * Sync selected step to URL query parameter.
   *
   * DESIGN DECISION: Uses direct router.replace instead of useRouting composable.
   *
   * Considerations:
   * - useRouting (@/shared/routing) is for cross-page navigation with org context
   * - This is in-page state persistence (like scroll position, active tab)
   * - useRouting.navigate() replaces entire query; we need to merge with existing
   * - These are fundamentally different use cases:
   *   - useRouting: goToFormEdit(form) → changes route path
   *   - This: ?step=abc123 → persists UI state on same page
   *
   * If query param state sync is needed in 2-3+ more places, consider adding
   * updateQueryParams(params, options) utility to useRouting.
   */
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
