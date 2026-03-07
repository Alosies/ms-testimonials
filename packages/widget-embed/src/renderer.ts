import type { WidgetConfig, WidgetData, WidgetTestimonial } from './types';
import baseStyles from './styles/base.css?inline';
import { renderWallOfLove } from './components/WallOfLove';
import { renderCarousel } from './components/Carousel';
import { renderSingleQuote } from './components/SingleQuote';
import { createEmptyState } from './components/LoadingState';
import { createErrorState } from './components/ErrorState';

type WidgetRenderer = (testimonials: WidgetTestimonial[], config: WidgetConfig) => HTMLElement;

const renderers: Partial<Record<WidgetConfig['type'], WidgetRenderer>> = {
  wall_of_love: renderWallOfLove,
  carousel: renderCarousel,
  single_quote: renderSingleQuote,
};

/**
 * Renders widget content into a Shadow DOM attached to the target element.
 */
export function renderWidget(
  element: HTMLElement,
  data: WidgetData | null,
): void {
  // Create or reuse shadow root
  const shadow =
    element.shadowRoot ?? element.attachShadow({ mode: 'open' });
  shadow.innerHTML = '';

  // Inject base styles
  const style = document.createElement('style');
  style.textContent = baseStyles;
  shadow.appendChild(style);

  // Apply theme
  if (data?.widget.theme === 'dark') {
    // Shadow DOM :host(.dark) requires the host element to have the class
    element.classList.add('dark');
  } else {
    element.classList.remove('dark');
  }

  // Error state
  if (!data) {
    shadow.appendChild(createErrorState());
    return;
  }

  // Empty state
  if (data.testimonials.length === 0) {
    shadow.appendChild(createEmptyState());
    return;
  }

  // Render widget type
  const render = renderers[data.widget.type];
  if (!render) {
    shadow.appendChild(createErrorState());
    return;
  }

  shadow.appendChild(render(data.testimonials, data.widget));
}
