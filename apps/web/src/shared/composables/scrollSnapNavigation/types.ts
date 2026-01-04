import type { Ref } from 'vue';

/**
 * Scroll-Snap Navigation Types
 * ============================
 *
 * Shared type definitions for the scroll-snap navigation system.
 * All composables in this folder use these types for consistency.
 */

/**
 * Configuration options for scroll-snap navigation.
 */
export interface ScrollSnapNavigationOptions {
  /**
   * CSS selector for the scroll container.
   * The container should have scroll-snap-type set.
   * @example '.timeline-scroll'
   */
  containerSelector: string;

  /**
   * CSS selector for navigable items.
   * Items should have scroll-snap-align set.
   * Use data attributes like [data-step-index] for reliable selection.
   * @example '[data-step-index]'
   */
  itemSelector: string;

  /**
   * Function that returns the current number of items.
   * Used to validate navigation bounds.
   */
  itemCount: () => number;

  /**
   * Current selected index (reactive).
   * The composable will read from this and call onSelect to update.
   */
  selectedIndex: Ref<number>;

  /**
   * Callback when selection changes (from keyboard or scroll detection).
   */
  onSelect: (index: number) => void;

  /**
   * Enable keyboard navigation (ArrowUp/Down, j/k).
   * @default true
   */
  enableKeyboard?: boolean;

  /**
   * Enable scroll detection (auto-select centered item on manual scroll).
   * @default true
   */
  enableScrollDetection?: boolean;

  /**
   * Debounce time for scroll detection (ms).
   * @default 50
   */
  scrollDebounceMs?: number;
}

/**
 * Internal context shared between navigation sub-composables.
 * This is created by the main composable and passed to helpers.
 */
export interface ScrollNavContext {
  containerSelector: string;
  itemSelector: string;
  itemCount: () => number;
  selectedIndex: Ref<number>;
  onSelect: (index: number) => void;
}

/**
 * State managed by useProgrammaticScroll.
 */
export interface ProgrammaticScrollState {
  /**
   * Flag indicating if current scroll is programmatic (keyboard/API).
   * When true, scroll detection should be disabled to prevent conflicts.
   */
  isProgrammaticScroll: Ref<boolean>;

  /**
   * Navigate to a specific index with scrolling.
   */
  navigateTo: (index: number) => void;

  /**
   * Mark scroll as complete (clears programmatic flag).
   */
  markScrollComplete: () => void;

  /**
   * Cleanup timeouts.
   */
  cleanup: () => void;
}

/**
 * State managed by useScrollDetection.
 */
export interface ScrollDetectionState {
  /**
   * Initialize scroll listeners on container.
   */
  initialize: () => void;

  /**
   * Remove scroll listeners and cleanup.
   */
  cleanup: () => void;

  /**
   * Force detection of currently centered item.
   */
  detectCenteredItem: () => void;
}

/**
 * Return type of the main useScrollSnapNavigation composable.
 */
export interface ScrollSnapNavigation {
  /** Flag indicating if current scroll is programmatic */
  isProgrammaticScroll: Readonly<Ref<boolean>>;

  /** Whether navigation to next item is possible */
  canNavigateNext: Readonly<Ref<boolean>>;

  /** Whether navigation to previous item is possible */
  canNavigatePrev: Readonly<Ref<boolean>>;

  /** Navigate to a specific index with scrolling */
  navigateTo: (index: number) => void;

  /** Navigate to the next item */
  navigateNext: () => void;

  /** Navigate to the previous item */
  navigatePrev: () => void;

  /** Select an item without triggering scroll */
  selectWithoutScroll: (index: number) => void;

  /** Manually initialize the navigation system */
  initialize: () => void;

  /** Cleanup all listeners and state */
  cleanup: () => void;

  /** Find the index of the item closest to viewport center */
  findCenteredItemIndex: () => number;
}
