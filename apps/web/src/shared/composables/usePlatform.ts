import { computed } from 'vue';

/**
 * Platform detection composable for keyboard shortcut display.
 * Detects Mac vs Windows/Linux to show appropriate modifier key symbols.
 */
export function usePlatform() {
  const isMac = computed(() => {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  });

  /** Modifier key symbol: ⌘ on Mac, Ctrl on Windows/Linux */
  const modifierKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'));

  /** Modifier key for display with + separator: ⌘ on Mac, Ctrl+ on Windows/Linux */
  const modifierKeyWithSeparator = computed(() => (isMac.value ? '⌘' : 'Ctrl+'));

  return {
    isMac,
    modifierKey,
    modifierKeyWithSeparator,
  };
}
