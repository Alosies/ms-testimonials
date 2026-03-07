import type { WidgetConfig, WidgetData, WidgetTestimonial } from './types';
import baseStyles from './styles/base.css?inline';
import { renderWallOfLove } from './components/WallOfLove';
import { renderCarousel } from './components/Carousel';
import { renderSingleQuote } from './components/SingleQuote';
import { renderMarquee } from './components/Marquee';
import { renderRatingBadge } from './components/RatingBadge';
import { renderAvatarsBar } from './components/AvatarsBar';
import { renderToastPopup } from './components/ToastPopup';
import { createEmptyState } from './components/LoadingState';
import { createErrorState } from './components/ErrorState';

type WidgetRenderer = (
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
  data?: WidgetData,
) => HTMLElement;

const renderers: Partial<Record<WidgetConfig['type'], WidgetRenderer>> = {
  wall_of_love: renderWallOfLove,
  carousel: renderCarousel,
  single_quote: renderSingleQuote,
  marquee: renderMarquee,
  rating_badge: renderRatingBadge,
  avatars_bar: renderAvatarsBar,
  toast_popup: renderToastPopup,
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

  // Empty state (skip for types that can render without testimonials)
  const typesWithoutTestimonials = ['rating_badge', 'avatars_bar'];
  if (data.testimonials.length === 0 && !typesWithoutTestimonials.includes(data.widget.type)) {
    shadow.appendChild(createEmptyState());
    return;
  }

  // Render widget type
  const render = renderers[data.widget.type];
  if (!render) {
    shadow.appendChild(createErrorState());
    return;
  }

  shadow.appendChild(render(data.testimonials, data.widget, data));
}
