import { onKeyStroke } from '@vueuse/core';
import type { Ref } from 'vue';
import { isInputFocused } from './utils';

/**
 * Keyboard Navigation Composable
 * ==============================
 *
 * Handles keyboard shortcuts for scroll-snap navigation.
 * Supports ArrowUp/Down and vim-style j/k keys.
 *
 * KEYBOARD SHORTCUTS:
 * - ArrowDown, j - Navigate to next item
 * - ArrowUp, k - Navigate to previous item
 *
 * INPUT PROTECTION:
 * Keyboard handlers are disabled when an input, textarea,
 * or contenteditable element is focused. This allows users
 * to type without triggering navigation.
 *
 * INTEGRATION:
 * This composable does NOT handle scrolling directly.
 * It calls the provided navigateNext/navigatePrev callbacks,
 * which should trigger programmatic scroll with proper coordination.
 *
 * @param canNavigateNext - Ref indicating if next navigation is possible
 * @param canNavigatePrev - Ref indicating if previous navigation is possible
 * @param navigateNext - Callback to navigate to next item
 * @param navigatePrev - Callback to navigate to previous item
 */
export function useKeyboardNavigation(
  canNavigateNext: Ref<boolean>,
  canNavigatePrev: Ref<boolean>,
  navigateNext: () => void,
  navigatePrev: () => void
): void {
  /**
   * Handle down navigation (ArrowDown, j).
   */
  function handleKeyDown(): void {
    if (isInputFocused()) return;
    if (canNavigateNext.value) {
      navigateNext();
    }
  }

  /**
   * Handle up navigation (ArrowUp, k).
   */
  function handleKeyUp(): void {
    if (isInputFocused()) return;
    if (canNavigatePrev.value) {
      navigatePrev();
    }
  }

  // Register keyboard handlers with VueUse
  // These are automatically cleaned up when the component unmounts
  onKeyStroke(['ArrowDown', 'j'], handleKeyDown, { eventName: 'keydown' });
  onKeyStroke(['ArrowUp', 'k'], handleKeyUp, { eventName: 'keydown' });
}
