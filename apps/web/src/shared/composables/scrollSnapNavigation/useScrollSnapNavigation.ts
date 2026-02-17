import { ref, readonly, computed, onMounted, onUnmounted, watch } from 'vue';
import type { ScrollSnapNavigationOptions, ScrollSnapNavigation } from './types';
import { useProgrammaticScroll } from './useProgrammaticScroll';
import { useScrollDetection } from './useScrollDetection';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { getContainer, findCenteredItemIndex as findCenteredItemIndexUtil } from './utils';

/**
 * Centralized Scroll-Snap Navigation Composable
 * ==============================================
 *
 * Provides a single source of truth for scroll-snap based navigation.
 * Composes smaller focused composables for maintainability.
 *
 * FEATURES:
 * - Keyboard navigation (ArrowUp/Down, j/k, vim-style)
 * - Manual scroll detection (updates selection to centered item)
 * - Programmatic scroll with scrollIntoView (works with scroll-snap)
 * - Uses scrollend event with fallback for older browsers
 *
 * ARCHITECTURE:
 * This composable is broken into smaller units for maintainability:
 * - useProgrammaticScroll - Handles scrollIntoView with flag coordination
 * - useScrollDetection - Handles scroll events and centered item detection
 * - useKeyboardNavigation - Handles keyboard shortcuts
 * - utils.ts - Pure DOM helper functions
 *
 * WHY CENTRALIZED:
 * Scroll-snap navigation requires careful coordination between:
 * 1. Selection state
 * 2. Keyboard events
 * 3. Scroll events
 * 4. Programmatic scrolling
 *
 * When these are in separate files without coordination, it's easy to
 * break one without understanding the others. This composable keeps
 * the coordination logic together while delegating to focused sub-composables.
 *
 * USAGE:
 * ```ts
 * const navigation = useScrollSnapNavigation({
 *   containerSelector: '.timeline-scroll',
 *   itemSelector: '[data-step-index]',
 *   itemCount: () => steps.value.length,
 *   selectedIndex: editor.selectedIndex,
 *   onSelect: (index) => editor.selectStep(index),
 * });
 *
 * // Navigate programmatically
 * navigation.navigateTo(2);
 *
 * // Keyboard navigation works automatically
 * ```
 *
 * CSS REQUIREMENTS:
 * - Container needs: scroll-snap-type: y mandatory; overflow-y: auto;
 * - Items need: scroll-snap-align: center; and data-step-index attribute
 *
 * @param options - Configuration options
 * @returns Navigation state and methods
 */
export function useScrollSnapNavigation(
  options: ScrollSnapNavigationOptions
): ScrollSnapNavigation {
  const {
    containerSelector,
    itemSelector,
    itemCount,
    selectedIndex,
    onSelect,
    onSelectById,
    enableKeyboard = true,
    enableScrollDetection = true,
    scrollDebounceMs = 50,
  } = options;

  // Create shared context for sub-composables
  const ctx = {
    containerSelector,
    itemSelector,
    itemCount,
    selectedIndex,
    onSelect,
    onSelectById,
  };

  // ============================================
  // Compose Sub-Composables
  // ============================================

  // Programmatic scroll with coordination flag
  const programmaticScroll = useProgrammaticScroll(ctx);

  // Separate suppression flag that scrollend events cannot clear.
  // isProgrammaticScroll gets cleared by handleScrollEnd when scroll-snap settles,
  // but suppressDetection needs to block detection for a guaranteed duration.
  const isDetectionSuppressed = ref(false);

  // Scroll detection (only if enabled)
  const scrollDetection = enableScrollDetection
    ? useScrollDetection(
        ctx,
        programmaticScroll.isProgrammaticScroll,
        isDetectionSuppressed,
        programmaticScroll.markScrollComplete,
        scrollDebounceMs
      )
    : null;

  // ============================================
  // Computed Navigation State
  // ============================================

  const canNavigateNext = computed(() => selectedIndex.value < itemCount() - 1);
  const canNavigatePrev = computed(() => selectedIndex.value > 0);

  // ============================================
  // Navigation Methods
  // ============================================

  /**
   * Navigate to a specific index with scrolling.
   */
  function navigateTo(index: number): void {
    programmaticScroll.navigateTo(index);
  }

  /**
   * Navigate to the next item.
   */
  function navigateNext(): void {
    if (canNavigateNext.value) {
      navigateTo(selectedIndex.value + 1);
    }
  }

  /**
   * Navigate to the previous item.
   */
  function navigatePrev(): void {
    if (canNavigatePrev.value) {
      navigateTo(selectedIndex.value - 1);
    }
  }

  /**
   * Select an item without scrolling.
   * Useful when the item is already in view.
   */
  function selectWithoutScroll(index: number): void {
    if (index >= 0 && index < itemCount()) {
      onSelect(index);
    }
  }

  /**
   * Suppress scroll detection temporarily.
   * Use this before programmatic actions that will trigger scroll
   * but shouldn't update selection (e.g., keyboard branch switching, initial load).
   *
   * Uses a dedicated isDetectionSuppressed flag instead of isProgrammaticScroll,
   * because scrollend events clear isProgrammaticScroll prematurely when
   * scroll-snap settles after DOM layout changes.
   */
  let suppressionTimeout: ReturnType<typeof setTimeout> | null = null;

  function suppressDetection(durationMs: number = 500): void {
    // Clear any existing timeout
    if (suppressionTimeout) {
      clearTimeout(suppressionTimeout);
    }

    // Set dedicated suppression flag (not clearable by scrollend events)
    isDetectionSuppressed.value = true;

    // Auto-clear after duration
    suppressionTimeout = setTimeout(() => {
      isDetectionSuppressed.value = false;
      suppressionTimeout = null;
    }, durationMs);
  }

  /**
   * Find the index of the item closest to viewport center.
   * Exposed for debugging and manual use.
   */
  function findCenteredItemIndex(): number {
    const container = getContainer(containerSelector);
    return findCenteredItemIndexUtil(container, itemSelector);
  }

  // ============================================
  // Keyboard Navigation (if enabled)
  // ============================================

  if (enableKeyboard) {
    useKeyboardNavigation(
      canNavigateNext,
      canNavigatePrev,
      navigateNext,
      navigatePrev
    );
  }

  // ============================================
  // Lifecycle
  // ============================================

  /**
   * Initialize the navigation system.
   * Called automatically on mount, but can be called manually if needed.
   */
  function initialize(): void {
    scrollDetection?.initialize();
  }

  /**
   * Cleanup all listeners and state.
   * Called automatically on unmount.
   */
  function cleanup(): void {
    scrollDetection?.cleanup();
    programmaticScroll.cleanup();
    if (suppressionTimeout) {
      clearTimeout(suppressionTimeout);
      suppressionTimeout = null;
    }
  }

  // Auto-initialize on mount
  onMounted(() => {
    // Small delay to ensure DOM is ready
    setTimeout(initialize, 0);
  });

  // Auto-cleanup on unmount
  onUnmounted(cleanup);

  // Re-initialize if item count changes significantly
  watch(
    () => itemCount(),
    () => {
      // Re-initialize in case DOM structure changed
      scrollDetection?.cleanup();
      scrollDetection?.initialize();
    }
  );

  // ============================================
  // Public API
  // ============================================

  return {
    // State (readonly)
    isProgrammaticScroll: readonly(programmaticScroll.isProgrammaticScroll),
    canNavigateNext,
    canNavigatePrev,

    // Navigation
    navigateTo,
    navigateNext,
    navigatePrev,
    selectWithoutScroll,
    suppressDetection,

    // Manual control
    initialize,
    cleanup,

    // Debugging
    findCenteredItemIndex,
  };
}
