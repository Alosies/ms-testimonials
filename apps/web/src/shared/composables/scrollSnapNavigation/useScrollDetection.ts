import { watch, type Ref } from 'vue';
import type { ScrollNavContext, ScrollDetectionState } from './types';
import { getContainer, findCenteredItemIndex, findCenteredItemId, supportsScrollEndEvent } from './utils';

/**
 * Scroll Detection Composable
 * ===========================
 *
 * Detects manual scrolling and updates selection to the centered item.
 * Respects the isProgrammaticScroll flag to avoid conflicts with keyboard nav.
 *
 * HOW IT WORKS:
 * 1. Listens to scroll events on the container
 * 2. Debounces to avoid excessive calculations
 * 3. When scroll stabilizes, finds the item closest to center
 * 4. Calls onSelect to update selection
 *
 * COORDINATION WITH PROGRAMMATIC SCROLL:
 * When isProgrammaticScroll is true, detection is disabled.
 * This prevents the following scenario:
 * - User presses ArrowDown
 * - navigateTo(2) is called, scrolling starts
 * - Scroll event fires when passing step 1
 * - Without the flag, detection would select step 1
 * - This causes the "skipping" bug
 *
 * SCROLLEND EVENT:
 * Modern browsers support the scrollend event which fires when
 * scrolling completes. We use this to clear the programmatic flag
 * and run detection. For older browsers, we use a debounce timeout.
 *
 * @param ctx - Navigation context
 * @param isProgrammaticScroll - Ref to check if scroll is programmatic
 * @param onScrollEnd - Callback when scroll completes (clears programmatic flag)
 * @param debounceMs - Debounce time for scroll detection
 * @returns Scroll detection state and methods
 */
export function useScrollDetection(
  ctx: ScrollNavContext,
  isProgrammaticScroll: Ref<boolean>,
  onScrollEnd: () => void,
  debounceMs: number = 50
): ScrollDetectionState {
  let container: HTMLElement | null = null;
  let scrollDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastSelectionTime = 0;
  // Ignore scroll detection for 800ms after selection.
  // This needs to be longer than typical smooth scroll animations to prevent
  // scroll detection from overriding keyboard navigation in branched views.
  const SELECTION_COOLDOWN_MS = 800;

  const hasScrollEndSupport = supportsScrollEndEvent();

  // Track when selection changes to avoid detection conflicts
  watch(
    () => ctx.selectedIndex.value,
    () => {
      lastSelectionTime = Date.now();
    }
  );

  /**
   * Detect and select the item closest to the viewport center.
   * Only runs when scroll is not programmatic.
   *
   * If onSelectById is provided, uses ID-based selection which is more robust
   * for branched views where the same step may have different indices.
   */
  function detectCenteredItem(): void {
    if (isProgrammaticScroll.value) return;

    // Skip detection if a selection was made recently (prevents overriding keyboard/click selections)
    if (Date.now() - lastSelectionTime < SELECTION_COOLDOWN_MS) return;

    // Prefer ID-based selection when available (more robust for branched views)
    if (ctx.onSelectById) {
      const centeredId = findCenteredItemId(container, ctx.itemSelector);
      if (centeredId !== null) {
        ctx.onSelectById(centeredId);
      }
      return;
    }

    // Fall back to index-based selection
    const centeredIndex = findCenteredItemIndex(container, ctx.itemSelector);
    if (centeredIndex !== -1 && centeredIndex !== ctx.selectedIndex.value) {
      ctx.onSelect(centeredIndex);
    }
  }

  /**
   * Handle scroll event (debounced).
   */
  function handleScroll(): void {
    if (scrollDebounceTimeout) {
      clearTimeout(scrollDebounceTimeout);
    }

    scrollDebounceTimeout = setTimeout(detectCenteredItem, debounceMs);
  }

  /**
   * Handle scrollend event.
   * Clears the programmatic flag and runs detection.
   *
   * IMPORTANT: Check flag BEFORE clearing it, not after.
   * The old logic cleared the flag then checked it, which was always false.
   */
  function handleScrollEnd(): void {
    // Check if scroll was programmatic BEFORE clearing the flag
    const wasProgrammatic = isProgrammaticScroll.value;

    onScrollEnd();

    // Only run detection if scroll was NOT programmatic
    // This prevents scroll detection from overriding keyboard navigation
    if (!wasProgrammatic) {
      detectCenteredItem();
    }
  }

  /**
   * Initialize scroll listeners on the container.
   */
  function initialize(): void {
    container = getContainer(ctx.containerSelector);
    if (!container) {
      console.warn(
        `[useScrollDetection] Container not found: ${ctx.containerSelector}`
      );
      return;
    }

    // Set up scroll listener (always, for debounced detection)
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Set up scrollend listener if supported
    if (hasScrollEndSupport) {
      container.addEventListener('scrollend', handleScrollEnd, { passive: true });
    }
  }

  /**
   * Remove scroll listeners and cleanup.
   */
  function cleanup(): void {
    if (container) {
      container.removeEventListener('scroll', handleScroll);
      if (hasScrollEndSupport) {
        container.removeEventListener('scrollend', handleScrollEnd);
      }
    }

    if (scrollDebounceTimeout) {
      clearTimeout(scrollDebounceTimeout);
      scrollDebounceTimeout = null;
    }

    container = null;
  }

  return {
    initialize,
    cleanup,
    detectCenteredItem,
  };
}
