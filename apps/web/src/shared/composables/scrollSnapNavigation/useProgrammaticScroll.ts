import { ref } from 'vue';
import type { ScrollNavContext, ProgrammaticScrollState } from './types';
import { getItemByIndex, supportsScrollEndEvent } from './utils';

/**
 * Programmatic Scroll Composable
 * ==============================
 *
 * Manages programmatic scrolling with a coordination flag to prevent
 * conflicts with scroll detection.
 *
 * CRITICAL CONCEPT - isProgrammaticScroll Flag:
 * =============================================
 * When navigating via keyboard or API, we need to:
 * 1. Set isProgrammaticScroll = true (BEFORE scrolling)
 * 2. Call scrollIntoView to scroll to the target
 * 3. Scroll events fire, but scroll detection ignores them
 * 4. On scrollend (or fallback timeout), set isProgrammaticScroll = false
 *
 * Without this flag, scroll detection would fight with keyboard navigation,
 * causing steps to "skip" unpredictably.
 *
 * WHY scrollIntoView (NOT scrollTo):
 * ==================================
 * The scroll container uses CSS scroll-snap-type: y mandatory.
 * - scrollTo() with manual position calculation CONFLICTS with scroll-snap
 *   because the browser's snap adjustment happens after our scroll
 * - scrollIntoView() WORKS WITH scroll-snap because it lets the browser
 *   handle the final position, including snap alignment
 *
 * DO NOT change to scrollTo() - this was a bug that took time to debug.
 *
 * @param ctx - Navigation context with container/item selectors
 * @returns Programmatic scroll state and methods
 */
export function useProgrammaticScroll(ctx: ScrollNavContext): ProgrammaticScrollState {
  /**
   * Flag to prevent scroll detection from overriding programmatic navigation.
   * This is the key coordination mechanism between keyboard nav and scroll detection.
   */
  const isProgrammaticScroll = ref(false);

  // Timeout for scrollend fallback
  let scrollEndFallbackTimeout: ReturnType<typeof setTimeout> | null = null;

  // Check scrollend support once
  const hasScrollEndSupport = supportsScrollEndEvent();

  /**
   * Clear the programmatic scroll flag.
   * Called when scroll animation completes.
   */
  function markScrollComplete(): void {
    if (scrollEndFallbackTimeout) {
      clearTimeout(scrollEndFallbackTimeout);
      scrollEndFallbackTimeout = null;
    }
    isProgrammaticScroll.value = false;
  }

  /**
   * Navigate to a specific index with smooth scrolling.
   *
   * Uses scrollIntoView which correctly works with CSS scroll-snap.
   * Sets isProgrammaticScroll flag to prevent scroll detection interference.
   *
   * @param index - The index to navigate to (0-based)
   */
  function navigateTo(index: number): void {
    const count = ctx.itemCount();
    if (index < 0 || index >= count) return;

    // Update selection first
    ctx.onSelect(index);

    // Mark as programmatic BEFORE scrolling
    isProgrammaticScroll.value = true;

    // Clear any pending fallback timeout
    if (scrollEndFallbackTimeout) {
      clearTimeout(scrollEndFallbackTimeout);
    }

    // Scroll to the item using scrollIntoView (works with scroll-snap)
    const item = getItemByIndex(ctx.itemSelector, index);
    if (item) {
      item.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    // Set fallback timeout to clear the flag
    // The scrollend handler will clear it sooner if supported
    const fallbackMs = hasScrollEndSupport ? 1500 : 800;
    scrollEndFallbackTimeout = setTimeout(markScrollComplete, fallbackMs);
  }

  /**
   * Cleanup timeouts on unmount.
   */
  function cleanup(): void {
    if (scrollEndFallbackTimeout) {
      clearTimeout(scrollEndFallbackTimeout);
      scrollEndFallbackTimeout = null;
    }
  }

  return {
    isProgrammaticScroll,
    navigateTo,
    markScrollComplete,
    cleanup,
  };
}
