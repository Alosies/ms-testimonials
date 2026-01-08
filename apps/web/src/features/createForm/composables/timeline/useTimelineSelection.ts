/**
 * Timeline Selection - Step selection state and navigation checks
 *
 * Handles step selection state and computed navigation guards.
 * Extracted from useTimelineEditor for maintainability.
 *
 * ARCHITECTURE NOTE:
 * This handles selection state ONLY without scrolling.
 * For navigation with scrolling, use useScrollSnapNavigation.
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { FormStep } from '@/shared/stepCards';

interface SelectionDeps {
  steps: Ref<FormStep[]>;
}

export interface TimelineSelectionReturn {
  // State
  selectedIndex: Ref<number>;
  selectedStep: ComputedRef<FormStep | null>;

  // Navigation checks
  canGoNext: ComputedRef<boolean>;
  canGoPrev: ComputedRef<boolean>;

  // Actions
  selectStep: (index: number) => void;
  selectStepById: (id: string) => void;
  resetSelection: () => void;
}

export function useTimelineSelection(deps: SelectionDeps): TimelineSelectionReturn {
  const { steps } = deps;

  // ============================================
  // State
  // ============================================
  const selectedIndex = ref(0);

  // ============================================
  // Computed
  // ============================================
  const selectedStep = computed(() =>
    steps.value[selectedIndex.value] ?? null,
  );

  const canGoNext = computed(() =>
    selectedIndex.value < steps.value.length - 1,
  );

  const canGoPrev = computed(() => selectedIndex.value > 0);

  // ============================================
  // Actions
  // ============================================

  /**
   * Select a step by index WITHOUT scrolling.
   * For navigation with scrolling, use useScrollSnapNavigation.navigateTo()
   */
  function selectStep(index: number) {
    if (index >= 0 && index < steps.value.length) {
      selectedIndex.value = index;
    }
  }

  function selectStepById(id: string) {
    const index = steps.value.findIndex(s => s.id === id);
    if (index !== -1) {
      selectStep(index);
    }
  }

  function resetSelection() {
    selectedIndex.value = 0;
  }

  return {
    // State
    selectedIndex,
    selectedStep,

    // Navigation checks
    canGoNext,
    canGoPrev,

    // Actions
    selectStep,
    selectStepById,
    resetSelection,
  };
}
