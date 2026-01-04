import type { Ref } from 'vue';
import type { ScrollNavContext, ScrollDetectionState } from './types';
import { getContainer, findCenteredItemIndex, supportsScrollEndEvent } from './utils';

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

  const hasScrollEndSupport = supportsScrollEndEvent();

  /**
   * Detect and select the item closest to the viewport center.
   * Only runs when scroll is not programmatic.
   */
  function detectCenteredItem(): void {
    if (isProgrammaticScroll.value) return;

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
   */
  function handleScrollEnd(): void {
    onScrollEnd();

    // Also run detection in case we need to sync
    if (!isProgrammaticScroll.value) {
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
