import type { WidgetConfig, WidgetTestimonial, WidgetData } from '../types';
import type { RatingBadgeSettings } from '../types';
import { el } from './shared';

export function renderRatingBadge(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
  data?: WidgetData,
): HTMLElement {
  const settings = config.settings as RatingBadgeSettings;
  const isCard = settings.style !== 'inline';

  const container = el('div', 'tw-rating-badge');

  const style = document.createElement('style');
  style.textContent = `
    .tw-rating-badge-inner {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--tw-font);
    }
    .tw-rating-badge-inner.tw-badge-card {
      background: var(--tw-card-bg); border: 1px solid var(--tw-card-border);
      border-radius: 8px; padding: 12px 16px; box-shadow: var(--tw-card-shadow);
    }
    .tw-badge-stars {
      display: flex; gap: 1px;
    }
    .tw-badge-star {
      font-size: 16px; line-height: 1;
    }
    .tw-badge-avg {
      font-size: 16px; font-weight: 700; color: var(--tw-fg);
    }
    .tw-badge-sep {
      color: var(--tw-fg-muted); font-size: 14px;
    }
    .tw-badge-count {
      font-size: 14px; color: var(--tw-fg-muted);
    }
    .tw-badge-link {
      text-decoration: none; color: inherit;
    }
    .tw-badge-link:hover {
      opacity: 0.85;
    }
  `;
  container.appendChild(style);

  // Compute aggregates from data or testimonials
  const aggregates = data?.aggregates;
  const ratings = testimonials
    .map((t) => t.rating)
    .filter((r): r is number => r !== null);
  const avgRating = aggregates?.average_rating
    ?? (ratings.length > 0
      ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
      : null);
  const totalCount = aggregates?.total_count ?? testimonials.length;

  const inner = el('div', `tw-rating-badge-inner${isCard ? ' tw-badge-card' : ''}`);

  // Stars
  if (avgRating !== null) {
    const starsContainer = el('div', 'tw-badge-stars');
    for (let i = 1; i <= 5; i++) {
      const star = el('span', 'tw-badge-star');
      star.innerHTML = '★';
      star.style.color = i <= Math.round(avgRating)
        ? 'var(--tw-star)'
        : 'var(--tw-star-empty)';
      starsContainer.appendChild(star);
    }
    inner.appendChild(starsContainer);

    // Average number
    if (settings.show_average) {
      const avg = el('span', 'tw-badge-avg');
      avg.textContent = String(avgRating);
      inner.appendChild(avg);
    }
  }

  // Count text
  if (settings.show_count && totalCount > 0) {
    if (avgRating !== null) {
      const sep = el('span', 'tw-badge-sep');
      sep.textContent = '·';
      inner.appendChild(sep);
    }
    const count = el('span', 'tw-badge-count');
    count.textContent = `${totalCount} review${totalCount !== 1 ? 's' : ''}`;
    inner.appendChild(count);
  }

  // Wrap in link if configured
  if (settings.link_to_wall) {
    const link = document.createElement('a');
    link.className = 'tw-badge-link';
    link.href = settings.link_to_wall;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(inner);
    container.appendChild(link);
  } else {
    container.appendChild(inner);
  }

  return container;
}
