/**
 * Scroll-Snap Navigation Utilities
 * =================================
 *
 * Pure DOM helper functions for scroll-snap navigation.
 * These have no Vue reactivity - they operate on raw DOM elements.
 *
 * WHY SEPARATE:
 * - Keeps DOM manipulation logic isolated and testable
 * - Can be reused across different navigation implementations
 * - Makes the reactive composables cleaner and focused
 */

/**
 * Get the scroll container element by CSS selector.
 *
 * @param selector - CSS selector for the container
 * @returns The container element, or null if not found
 */
export function getContainer(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

/**
 * Get a navigable item element by its index.
 *
 * Tries data-step-index attribute first (most reliable),
 * then falls back to indexing into all items.
 *
 * @param itemSelector - CSS selector for items
 * @param index - The item index to find
 * @returns The item element, or null if not found
 */
export function getItemByIndex(itemSelector: string, index: number): Element | null {
  // Try data-step-index first (most reliable)
  const byDataAttr = document.querySelector(`${itemSelector}[data-step-index="${index}"]`);
  if (byDataAttr) return byDataAttr;

  // Fallback: get all items and index into them
  const items = document.querySelectorAll(itemSelector);
  return items[index] ?? null;
}

/**
 * Find the item closest to the center of the scroll container's viewport.
 *
 * This is the core algorithm for scroll-based selection.
 * It measures the distance from each item's center to the container's center.
 *
 * @param container - The scroll container element
 * @param itemSelector - CSS selector for navigable items
 * @returns The index of the centered item, or -1 if none found
 *
 * @example
 * ```ts
 * const container = document.querySelector('.timeline-scroll');
 * const centeredIndex = findCenteredItemIndex(container, '[data-step-index]');
 * if (centeredIndex !== -1) {
 *   onSelect(centeredIndex);
 * }
 * ```
 */
export function findCenteredItemIndex(
  container: HTMLElement | null,
  itemSelector: string
): number {
  if (!container) return -1;

  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.top + containerRect.height / 2;

  const items = container.querySelectorAll(itemSelector);
  let closestIndex = -1;
  let closestDistance = Infinity;

  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - containerCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      // Try to get index from data attribute
      const indexAttr = item.getAttribute('data-step-index');
      if (indexAttr !== null) {
        closestIndex = parseInt(indexAttr, 10);
      }
    }
  });

  return closestIndex;
}

/**
 * Find the ID of the item closest to the center of the scroll container's viewport.
 *
 * Similar to findCenteredItemIndex but returns the item's ID instead of index.
 * This is more robust for branched views where the same step may have different
 * indices in different contexts (flow-local vs main array).
 *
 * @param container - The scroll container element
 * @param itemSelector - CSS selector for navigable items
 * @returns The ID of the centered item, or null if none found
 *
 * @example
 * ```ts
 * const container = document.querySelector('.timeline-scroll');
 * const centeredId = findCenteredItemId(container, '[data-step-id]');
 * if (centeredId) {
 *   editor.selectStepById(centeredId);
 * }
 * ```
 */
export function findCenteredItemId(
  container: HTMLElement | null,
  itemSelector: string
): string | null {
  if (!container) return null;

  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.top + containerRect.height / 2;

  const items = container.querySelectorAll(itemSelector);
  let closestId: string | null = null;
  let closestDistance = Infinity;

  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const distance = Math.abs(itemCenter - containerCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      // Get ID from data attribute
      const idAttr = item.getAttribute('data-step-id');
      if (idAttr !== null) {
        closestId = idAttr;
      }
    }
  });

  return closestId;
}

/**
 * Check if the currently focused element is an input.
 *
 * Used to disable keyboard navigation when user is typing.
 *
 * @returns True if an input, textarea, or contenteditable element is focused
 */
export function isInputFocused(): boolean {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el?.getAttribute('contenteditable') === 'true'
  );
}

/**
 * Check if the browser supports the scrollend event.
 *
 * scrollend is a modern event that fires when scrolling completes.
 * Older browsers need a timeout fallback.
 *
 * @returns True if scrollend event is supported
 */
export function supportsScrollEndEvent(): boolean {
  return typeof window !== 'undefined' && 'onscrollend' in window;
}
