import type { WidgetData } from './types';

/**
 * Infers the API base URL from the embed script's src attribute.
 * Falls back to the data-api-url attribute on the widget element,
 * or the current page origin.
 */
function getApiBaseUrl(element?: Element | null): string {
  // Check data-api-url on the widget element
  if (element) {
    const explicitUrl = element.getAttribute('data-api-url');
    if (explicitUrl) return explicitUrl.replace(/\/$/, '');
  }

  // Infer from script src
  const scripts = document.querySelectorAll('script[src*="widgets.js"]');
  for (const script of scripts) {
    const src = script.getAttribute('src');
    if (src) {
      try {
        const url = new URL(src, window.location.href);
        return `${url.origin}`;
      } catch {
        // Ignore malformed URLs
      }
    }
  }

  return window.location.origin;
}

/**
 * Fetches widget data from the public API endpoint.
 * Returns null on any failure for graceful degradation.
 */
export async function fetchWidgetData(
  widgetId: string,
  element?: Element | null,
): Promise<WidgetData | null> {
  const baseUrl = getApiBaseUrl(element);
  const apiUrl = `${baseUrl}/public/widgets/${widgetId}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) return null;
    const data: WidgetData = await response.json();
    if (!data.widget || !data.testimonials) return null;
    return data;
  } catch {
    return null;
  }
}
