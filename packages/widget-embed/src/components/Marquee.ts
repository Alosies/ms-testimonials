import type { WidgetConfig, WidgetTestimonial } from '../types';
import type { MarqueeSettings } from '../types';
import { createTestimonialCard, createStars, el } from './shared';

export function renderMarquee(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
): HTMLElement {
  const settings = config.settings as MarqueeSettings;
  const isCompact = settings.card_style === 'compact';
  const direction = settings.direction === 'right' ? 'reverse' : 'normal';
  // Speed: lower value = faster. Map px/sec to duration based on content width estimate.
  const itemWidth = isCompact ? 320 : 360;
  const totalWidth = testimonials.length * itemWidth;
  const duration = Math.max(totalWidth / settings.speed, 5);

  const container = el('div', 'tw-marquee');

  const style = document.createElement('style');
  style.textContent = `
    .tw-marquee {
      overflow: hidden; padding: 8px 0;
    }
    .tw-marquee-track {
      display: flex; gap: 16px;
      animation: tw-marquee-scroll ${duration}s linear infinite;
      animation-direction: ${direction};
      will-change: transform; width: max-content;
    }
    ${settings.pause_on_hover ? `.tw-marquee-track:hover { animation-play-state: paused; }` : ''}
    @keyframes tw-marquee-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .tw-marquee-compact {
      display: flex; align-items: center; gap: 8px;
      background: var(--tw-card-bg); border: 1px solid var(--tw-card-border);
      border-radius: 8px; padding: 10px 16px; white-space: nowrap;
      box-shadow: var(--tw-card-shadow); flex-shrink: 0;
    }
    .tw-marquee-compact-text {
      font-size: 14px; color: var(--tw-fg);
      max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .tw-marquee-compact-author {
      font-size: 13px; color: var(--tw-fg-muted); white-space: nowrap;
    }
    .tw-marquee-full-item {
      flex-shrink: 0; width: 320px;
    }
  `;
  container.appendChild(style);

  const track = el('div', 'tw-marquee-track');

  // Render testimonials twice for seamless loop
  const renderItems = () => {
    for (const testimonial of testimonials) {
      if (isCompact) {
        track.appendChild(createCompactCard(testimonial, config));
      } else {
        const wrapper = el('div', 'tw-marquee-full-item');
        wrapper.appendChild(createTestimonialCard(testimonial, config));
        track.appendChild(wrapper);
      }
    }
  };

  renderItems(); // First set
  renderItems(); // Duplicate for seamless loop

  container.appendChild(track);

  return container;
}

function createCompactCard(
  testimonial: WidgetTestimonial,
  config: WidgetConfig,
): HTMLElement {
  const card = el('div', 'tw-marquee-compact');

  // Stars
  const stars = createStars(testimonial.rating, config);
  if (stars) {
    stars.style.cssText += 'flex-shrink: 0;';
    card.appendChild(stars);
  }

  // Truncated quote
  if (testimonial.content) {
    const text = el('span', 'tw-marquee-compact-text');
    text.textContent = `"${testimonial.content}"`;
    card.appendChild(text);
  }

  // Author
  if (testimonial.customer_name) {
    const author = el('span', 'tw-marquee-compact-author');
    author.textContent = `— ${testimonial.customer_name}`;
    card.appendChild(author);
  }

  return card;
}
