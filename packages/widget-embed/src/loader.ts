import { fetchWidgetData } from './api';
import { renderWidget } from './renderer';
import { createLoadingState } from './components/LoadingState';

const SELECTOR = '[data-testimonials-widget]';
const INITIALIZED_ATTR = 'data-tw-initialized';

/**
 * Finds all widget placeholder elements and initializes them.
 */
export async function initWidgets(): Promise<void> {
  const elements = document.querySelectorAll<HTMLElement>(SELECTOR);

  const promises = Array.from(elements).map((element) =>
    initWidget(element),
  );

  await Promise.allSettled(promises);
}

async function initWidget(element: HTMLElement): Promise<void> {
  // Skip already-initialized elements
  if (element.hasAttribute(INITIALIZED_ATTR)) return;
  element.setAttribute(INITIALIZED_ATTR, 'true');

  const widgetId = element.getAttribute('data-widget-id');
  if (!widgetId) return;

  // Show loading state
  const shadow = element.attachShadow({ mode: 'open' });
  shadow.appendChild(createLoadingState());

  // Fetch and render
  const data = await fetchWidgetData(widgetId, element);
  renderWidget(element, data);
}

/**
 * Watches for dynamically added widget elements via MutationObserver.
 */
export function observeDynamicWidgets(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.matches(SELECTOR)) {
            initWidget(node);
          }
          // Check children too
          const children = node.querySelectorAll<HTMLElement>(SELECTOR);
          children.forEach((child) => initWidget(child));
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
