/**
 * Timeline Selection - Selection state and navigation (ADR-014 Phase 5)
 *
 * Singleton composable that composes from useTimelineState.
 * Provides selection state, navigation, and auto-correction.
 */
import { computed, watch, type Ref } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type { FormStep } from '@/entities/formStep';
import { useTimelineState } from './useTimelineState';
import type { TimelineSelection, TimelineSelectionReturn } from '../../models/timeline';

// Re-export types for consumers (CR-002: types from models/)
export type { TimelineSelection, TimelineSelectionReturn } from '../../models/timeline';

/** Selection singleton - composes from useTimelineState */
export const useTimelineSelection = createSharedComposable((): TimelineSelection => {
  const state = useTimelineState();

  const selectedIndex = computed(() => state.selectedIndex.value);
  const currentStep = computed(() => state.currentStep.value);
  const canGoNext = computed(() => state.selectedIndex.value < state.steps.value.length - 1);
  const canGoPrev = computed(() => state.selectedIndex.value > 0);
  const isSelectionValid = computed(() =>
    state.selectedIndex.value >= 0 && state.selectedIndex.value < state.steps.value.length
  );

  // Auto-correct selection when steps change
  watch(() => state.steps.value.length, (len) => {
    if (state.selectedIndex.value >= len && len > 0) {
      state.selectedIndex.value = len - 1;
    }
  });

  function selectStep(index: number) {
    if (index >= 0 && index < state.steps.value.length) {
      state.selectedIndex.value = index;
    }
  }

  function selectStepById(id: string) {
    const index = state.steps.value.findIndex(s => s.id === id);
    if (index !== -1) selectStep(index);
  }

  function selectNextStep() {
    if (canGoNext.value) selectStep(state.selectedIndex.value + 1);
  }

  function selectPreviousStep() {
    if (canGoPrev.value) selectStep(state.selectedIndex.value - 1);
  }

  function resetSelection() {
    state.selectedIndex.value = 0;
  }

  return {
    selectedIndex,
    currentStep,
    canGoNext,
    canGoPrev,
    isSelectionValid,
    selectStep,
    selectStepById,
    selectNextStep,
    selectPreviousStep,
    resetSelection,
  };
});

// =============================================================================
// Backward Compatibility: Old interface for useTimelineEditor migration
// =============================================================================

interface SelectionDeps {
  steps: Ref<FormStep[]>;
}

/**
 * @deprecated Use useTimelineSelection() singleton instead.
 * This factory version is kept for backward compatibility with useTimelineEditor.
 *
 * **Migration Example:**
 * ```ts
 * // BEFORE (factory pattern - requires deps injection)
 * const { steps } = useStepState();
 * const { selectedIndex, selectStep } = useTimelineSelectionFactory({ steps });
 *
 * // AFTER (singleton pattern - no deps needed)
 * const { selectedIndex, currentStep, selectStep } = useTimelineSelection();
 * ```
 *
 * The singleton uses the shared state from useTimelineState, so all
 * components that call useTimelineSelection() share the same selection.
 *
 * TODO (Phase 7): Remove this factory once useTimelineEditor migrates to Phase 5 singletons.
 */
export function useTimelineSelectionFactory(deps: SelectionDeps): TimelineSelectionReturn {
  const { steps } = deps;
  const selection = useTimelineSelection();
  const state = useTimelineState();

  /**
   * Writable computed that bridges ComputedRef<number> to Ref<number>.
   * Reads from singleton's computed, writes to singleton's state.
   * This provides backward-compatible mutability for the old interface.
   */
  const writableSelectedIndex = computed({
    get: () => selection.selectedIndex.value,
    set: (value: number) => {
      if (value >= 0 && value < steps.value.length) {
        state.selectedIndex.value = value;
      }
    },
  });

  return {
    selectedIndex: writableSelectedIndex,
    selectedStep: computed(() => steps.value[selection.selectedIndex.value] ?? null),
    canGoNext: computed(() => selection.selectedIndex.value < steps.value.length - 1),
    canGoPrev: computed(() => selection.selectedIndex.value > 0),
    selectStep: (index: number) => {
      if (index >= 0 && index < steps.value.length) {
        state.selectedIndex.value = index;
      }
    },
    selectStepById: (id: string) => {
      const index = steps.value.findIndex(s => s.id === id);
      // Directly set state.selectedIndex instead of calling singleton's selectStep,
      // because singleton validates against state.steps which may be empty
      // (legacy useTimelineEditor uses useStepState, not useTimelineState)
      if (index !== -1 && index >= 0 && index < steps.value.length) {
        state.selectedIndex.value = index;
      }
    },
    resetSelection: selection.resetSelection,
  };
}
