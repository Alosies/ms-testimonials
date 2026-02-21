import type { WidgetConfig, WidgetTestimonial } from '../types';
import { createTestimonialCard, el } from './shared';

export function renderWallOfLove(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
): HTMLElement {
  const container = el('div', 'tw-wall');

  const style = document.createElement('style');
  style.textContent = `
    .tw-wall {
      column-count: 3;
      column-gap: 16px;
      padding: 8px;
    }
    .tw-wall-item {
      break-inside: avoid;
      margin-bottom: 16px;
    }
    @media (max-width: 768px) {
      .tw-wall { column-count: 2; }
    }
    @media (max-width: 480px) {
      .tw-wall { column-count: 1; }
    }
  `;
  container.appendChild(style);

  for (const testimonial of testimonials) {
    const wrapper = el('div', 'tw-wall-item');
    wrapper.appendChild(createTestimonialCard(testimonial, config));
    container.appendChild(wrapper);
  }

  return container;
}
