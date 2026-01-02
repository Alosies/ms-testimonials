import { computed, watch, onMounted, ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';

interface QuestionPanelUrlParams {
  question?: string;
  panel?: string;
}

export type PanelUrlMode = 'edit' | 'add' | null;

/**
 * URL-synchronized question panel state composable
 *
 * Provides bidirectional synchronization between question panel state
 * and URL query parameters. This allows the panel state to be:
 * - Shareable via URL
 * - Restored on page reload
 * - Navigated with browser back/forward buttons
 *
 * @example
 * ```typescript
 * const { selectedIndex, isPanelOpen, selectQuestion, closePanel } = useQuestionPanelUrl({
 *   totalQuestions: computed(() => questions.length)
 * });
 *
 * // Select question - URL becomes ?question=0
 * selectQuestion(0);
 *
 * // Close panel - URL clears question param
 * closePanel();
 * ```
 */
export function useQuestionPanelUrl(options: {
  totalQuestions: () => number;
  onIndexChange?: (index: number | null) => void;
}) {
  const { totalQuestions, onIndexChange } = options;

  // VueUse reactive URL params - automatically synced with browser URL
  const params = useUrlSearchParams<QuestionPanelUrlParams>('history', {
    initialValue: { question: undefined, panel: undefined },
    removeNullishValues: true,
  });

  // Track if we're making internal updates to prevent loops
  const isInternalUpdate = ref(false);

  // Computed selected index from URL param
  const selectedIndex = computed<number | null>(() => {
    if (params.question === undefined || params.question === null) {
      return null;
    }
    const index = parseInt(String(params.question), 10);
    if (isNaN(index) || index < 0 || index >= totalQuestions()) {
      return null;
    }
    return index;
  });

  // Panel is open if we have a valid selected index (edit mode)
  const isPanelOpen = computed(() => selectedIndex.value !== null);

  // Add panel is open if panel=add is in URL
  const isAddPanelOpen = computed(() => params.panel === 'add');

  // Current panel mode
  const panelMode = computed<PanelUrlMode>(() => {
    if (params.panel === 'add') return 'add';
    if (selectedIndex.value !== null) return 'edit';
    return null;
  });

  /**
   * Select a question by index - updates URL (edit mode)
   * Clears add mode if active
   */
  function selectQuestion(index: number) {
    if (index < 0 || index >= totalQuestions()) return;
    isInternalUpdate.value = true;
    params.question = String(index);
    params.panel = undefined; // Clear add mode
    isInternalUpdate.value = false;
  }

  /**
   * Close the edit panel - clears question param
   */
  function closePanel() {
    isInternalUpdate.value = true;
    params.question = undefined;
    isInternalUpdate.value = false;
  }

  /**
   * Open add panel - sets panel=add in URL
   * Clears edit mode if active
   */
  function openAddPanel() {
    isInternalUpdate.value = true;
    params.panel = 'add';
    params.question = undefined; // Clear edit mode
    isInternalUpdate.value = false;
  }

  /**
   * Close add panel - clears panel param
   */
  function closeAddPanel() {
    isInternalUpdate.value = true;
    params.panel = undefined;
    isInternalUpdate.value = false;
  }

  /**
   * Navigate to previous/next question
   */
  function navigate(direction: 'prev' | 'next') {
    const current = selectedIndex.value;
    if (current === null) return;

    if (direction === 'prev' && current > 0) {
      selectQuestion(current - 1);
    } else if (direction === 'next' && current < totalQuestions() - 1) {
      selectQuestion(current + 1);
    }
  }

  /**
   * Adjust selected index when questions are reordered
   */
  function adjustIndexForReorder(fromIndex: number, toIndex: number) {
    const current = selectedIndex.value;
    if (current === null) return;

    if (current === fromIndex) {
      // The selected question was moved
      selectQuestion(toIndex);
    } else if (fromIndex < current && toIndex >= current) {
      // Question moved from before to after selected
      selectQuestion(current - 1);
    } else if (fromIndex > current && toIndex <= current) {
      // Question moved from after to before selected
      selectQuestion(current + 1);
    }
  }

  /**
   * Adjust selected index when a question is removed
   */
  function adjustIndexForRemoval(removedIndex: number) {
    const current = selectedIndex.value;
    if (current === null) return;

    if (current === removedIndex) {
      // Selected question was removed - close panel
      closePanel();
    } else if (removedIndex < current) {
      // Question before selected was removed - decrement index
      selectQuestion(current - 1);
    }
  }

  // Watch for URL changes (browser back/forward)
  watch(
    () => selectedIndex.value,
    (newIndex) => {
      if (!isInternalUpdate.value && onIndexChange) {
        onIndexChange(newIndex);
      }
    }
  );

  // Validate on mount - clear invalid URL state
  onMounted(() => {
    if (params.question !== undefined) {
      const index = parseInt(String(params.question), 10);
      if (isNaN(index) || index < 0 || index >= totalQuestions()) {
        // Invalid index in URL - clear it
        closePanel();
      }
    }
  });

  return {
    // State
    selectedIndex,
    isPanelOpen,
    isAddPanelOpen,
    panelMode,

    // Actions
    selectQuestion,
    closePanel,
    openAddPanel,
    closeAddPanel,
    navigate,
    adjustIndexForReorder,
    adjustIndexForRemoval,
  };
}
