/**
 * Scroll-Snap Navigation Module
 * =============================
 *
 * Centralized scroll-snap based navigation for timeline-style UIs.
 *
 * ARCHITECTURE:
 * This module is organized into focused, single-responsibility units:
 *
 * - useScrollSnapNavigation.ts - Main composable (compose all below)
 * - useProgrammaticScroll.ts - scrollIntoView with coordination flag
 * - useScrollDetection.ts - Scroll events and centered item detection
 * - useKeyboardNavigation.ts - Keyboard shortcuts (ArrowUp/Down, j/k)
 * - utils.ts - Pure DOM helper functions
 * - types.ts - Shared TypeScript interfaces
 *
 * WHY THIS STRUCTURE:
 * Scroll-snap navigation was identified as frequently breaking code.
 * The tight coordination between scroll detection and keyboard navigation
 * makes it error-prone. This modular structure:
 *
 * 1. Makes each concern isolated and easier to understand
 * 2. Allows testing of individual pieces
 * 3. Makes debugging easier (you know where to look)
 * 4. Prevents accidental breakage through clear boundaries
 *
 * USAGE:
 * ```ts
 * import { useScrollSnapNavigation } from '@/shared/composables';
 *
 * const navigation = useScrollSnapNavigation({
 *   containerSelector: '.timeline-scroll',
 *   itemSelector: '[data-step-index]',
 *   itemCount: () => steps.value.length,
 *   selectedIndex: editor.selectedIndex,
 *   onSelect: (index) => editor.selectStep(index),
 * });
 * ```
 *
 * CSS REQUIREMENTS:
 * Container:
 *   scroll-snap-type: y mandatory;
 *   overflow-y: auto;
 *
 * Items:
 *   scroll-snap-align: center;
 *   data-step-index="0" (or 1, 2, etc.)
 *
 * @see FormEditorLayout.vue - Example container CSS
 * @see TimelineStepCard.vue - Example item CSS
 */

// Main composable - this is what consumers should use
export { useScrollSnapNavigation } from './useScrollSnapNavigation';

// Types for external use
export type {
  ScrollSnapNavigationOptions,
  ScrollSnapNavigation,
} from './types';

// Sub-composables (exported for advanced use cases or testing)
export { useProgrammaticScroll } from './useProgrammaticScroll';
export { useScrollDetection } from './useScrollDetection';
export { useKeyboardNavigation } from './useKeyboardNavigation';

// Utilities (exported for testing or custom implementations)
export {
  getContainer,
  getItemByIndex,
  findCenteredItemIndex,
  isInputFocused,
  supportsScrollEndEvent,
} from './utils';
