import type { WidgetConfig, WidgetTestimonial, WidgetData } from '../types';
import type { AvatarsBarSettings } from '../types';
import { el } from './shared';

const SIZES = { small: 32, medium: 40, large: 48 } as const;

export function renderAvatarsBar(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
  data?: WidgetData,
): HTMLElement {
  const settings = config.settings as AvatarsBarSettings;
  const size = SIZES[settings.size] ?? SIZES.medium;

  const container = el('div', 'tw-avatars-bar');

  const style = document.createElement('style');
  style.textContent = `
    .tw-avatars-bar {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }
    .tw-avatars-row {
      display: flex; align-items: center;
    }
    .tw-avatars-item {
      width: ${size}px; height: ${size}px; border-radius: 50%; overflow: hidden;
      border: 2px solid var(--tw-bg); background: var(--tw-avatar-bg);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .tw-avatars-item img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .tw-avatars-initials {
      font-size: ${Math.round(size * 0.35)}px; font-weight: 600;
      color: var(--tw-avatar-fg);
    }
    .tw-avatars-overflow {
      width: ${size}px; height: ${size}px; border-radius: 50%;
      border: 2px solid var(--tw-bg); background: var(--tw-card-border);
      display: flex; align-items: center; justify-content: center;
      font-size: ${Math.round(size * 0.3)}px; font-weight: 600;
      color: var(--tw-fg-muted);
    }
    .tw-avatars-label {
      font-size: 14px; color: var(--tw-fg-muted); text-align: center;
    }
    .tw-avatars-rating {
      display: flex; align-items: center; gap: 4px;
    }
    .tw-avatars-star {
      font-size: 14px; line-height: 1;
    }
    .tw-avatars-avg {
      font-size: 14px; font-weight: 600; color: var(--tw-fg);
    }
  `;
  container.appendChild(style);

  const aggregates = data?.aggregates;
  const totalCount = aggregates?.total_count ?? testimonials.length;
  const maxAvatars = settings.max_avatars;
  const overlapPx = settings.overlap_px;
  const displayed = testimonials.slice(0, maxAvatars);
  const overflowCount = totalCount - displayed.length;

  // Avatar row
  const row = el('div', 'tw-avatars-row');

  displayed.forEach((testimonial, i) => {
    const item = el('div', 'tw-avatars-item');
    if (i > 0) item.style.marginLeft = `-${overlapPx}px`;

    if (testimonial.customer_avatar_url) {
      const img = document.createElement('img');
      img.src = testimonial.customer_avatar_url;
      img.alt = testimonial.customer_name ?? '';
      img.onerror = () => {
        img.remove();
        item.appendChild(createInitials(testimonial.customer_name, size));
      };
      item.appendChild(img);
    } else {
      item.appendChild(createInitials(testimonial.customer_name, size));
    }

    row.appendChild(item);
  });

  // Overflow badge
  if (overflowCount > 0) {
    const overflow = el('div', 'tw-avatars-overflow');
    overflow.style.marginLeft = `-${overlapPx}px`;
    overflow.textContent = `+${overflowCount}`;
    row.appendChild(overflow);
  }

  container.appendChild(row);

  // Rating line
  if (settings.show_rating) {
    const ratings = testimonials
      .map((t) => t.rating)
      .filter((r): r is number => r !== null);
    const avgRating = aggregates?.average_rating
      ?? (ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10
        : null);

    if (avgRating !== null) {
      const ratingRow = el('div', 'tw-avatars-rating');
      for (let i = 1; i <= 5; i++) {
        const star = el('span', 'tw-avatars-star');
        star.innerHTML = '★';
        star.style.color = i <= Math.round(avgRating)
          ? 'var(--tw-star)'
          : 'var(--tw-star-empty)';
        ratingRow.appendChild(star);
      }
      const avg = el('span', 'tw-avatars-avg');
      avg.textContent = String(avgRating);
      ratingRow.appendChild(avg);
      container.appendChild(ratingRow);
    }
  }

  // Label
  const label = el('div', 'tw-avatars-label');
  label.textContent = settings.label_template.replace('{count}', String(totalCount));
  container.appendChild(label);

  return container;
}

function createInitials(name: string | null, size: number): HTMLElement {
  const span = el('span', 'tw-avatars-initials');
  span.style.fontSize = `${Math.round(size * 0.35)}px`;
  span.textContent = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  return span;
}
