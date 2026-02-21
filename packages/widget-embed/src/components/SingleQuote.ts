import type { WidgetConfig, WidgetTestimonial } from '../types';
import { createAttribution, createStars, createDateLine, el } from './shared';

export function renderSingleQuote(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
): HTMLElement {
  const container = el('div', 'tw-single-quote');
  container.style.cssText = 'padding: 8px;';

  if (testimonials.length === 0) return container;

  let currentIndex = 0;

  const style = document.createElement('style');
  style.textContent = `
    .tw-quote-card {
      text-align: center; padding: 32px 24px;
      background: var(--tw-card-bg); border: 1px solid var(--tw-card-border);
      border-radius: 12px; box-shadow: var(--tw-card-shadow);
    }
    .tw-quote-icon {
      font-size: 32px; color: var(--tw-fg-muted); opacity: 0.3;
      margin-bottom: 16px; line-height: 1;
    }
    .tw-quote-text {
      font-size: 18px; line-height: 1.7; color: var(--tw-fg);
      font-style: italic; margin-bottom: 20px; max-width: 600px;
      margin-left: auto; margin-right: auto;
    }
    .tw-quote-attribution {
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .tw-quote-fade {
      transition: opacity 0.4s ease;
    }
  `;
  container.appendChild(style);

  const card = el('div', 'tw-quote-card tw-quote-fade');

  function renderTestimonial(index: number) {
    const testimonial = testimonials[index];
    card.innerHTML = '';

    // Quote icon
    const icon = el('div', 'tw-quote-icon');
    icon.textContent = '"';
    card.appendChild(icon);

    // Quote text
    if (testimonial.content) {
      const text = el('p', 'tw-quote-text');
      text.textContent = `"${testimonial.content}"`;
      card.appendChild(text);
    }

    // Stars
    const stars = createStars(testimonial.rating, config);
    if (stars) {
      stars.style.cssText += 'justify-content: center; margin-bottom: 16px;';
      card.appendChild(stars);
    }

    // Date
    const date = createDateLine(testimonial, config);
    if (date) {
      date.style.cssText += 'margin-bottom: 12px; text-align: center;';
      card.appendChild(date);
    }

    // Attribution
    const attr = createAttribution(testimonial, config);
    attr.style.justifyContent = 'center';
    card.appendChild(attr);

    currentIndex = index;
  }

  container.appendChild(card);
  renderTestimonial(0);

  // Auto-rotate if multiple testimonials
  if (testimonials.length > 1) {
    setInterval(() => {
      card.style.opacity = '0';
      setTimeout(() => {
        renderTestimonial((currentIndex + 1) % testimonials.length);
        card.style.opacity = '1';
      }, 400);
    }, 5000);
  }

  return container;
}
