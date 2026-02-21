import type { WidgetConfig, WidgetTestimonial } from '../types';

export function createAvatar(
  testimonial: WidgetTestimonial,
  config: WidgetConfig,
): HTMLElement | null {
  if (!config.show_avatar) return null;

  const container = el('div', 'tw-avatar');
  container.style.cssText = `
    width: 40px; height: 40px; border-radius: 50%; overflow: hidden;
    background: var(--tw-avatar-bg); display: flex; align-items: center;
    justify-content: center; flex-shrink: 0;
  `;

  if (testimonial.customer_avatar_url) {
    const img = document.createElement('img');
    img.src = testimonial.customer_avatar_url;
    img.alt = testimonial.customer_name ?? '';
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
    img.onerror = () => {
      img.remove();
      container.appendChild(createInitials(testimonial.customer_name));
    };
    container.appendChild(img);
  } else {
    container.appendChild(createInitials(testimonial.customer_name));
  }

  return container;
}

function createInitials(name: string | null): HTMLElement {
  const span = el('span', 'tw-initials');
  span.style.cssText =
    'font-size: 14px; font-weight: 600; color: var(--tw-avatar-fg);';
  span.textContent = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';
  return span;
}

export function createStars(
  rating: number | null,
  config: WidgetConfig,
): HTMLElement | null {
  if (!config.show_ratings || !rating) return null;

  const container = el('div', 'tw-stars');
  container.style.cssText = 'display: flex; gap: 2px;';

  for (let i = 1; i <= 5; i++) {
    const star = el('span', 'tw-star');
    star.innerHTML = '★';
    star.style.cssText = `
      font-size: 14px; line-height: 1;
      color: ${i <= rating ? 'var(--tw-star)' : 'var(--tw-star-empty)'};
    `;
    container.appendChild(star);
  }

  return container;
}

export function createAttribution(
  testimonial: WidgetTestimonial,
  config: WidgetConfig,
): HTMLElement {
  const container = el('div', 'tw-attribution');
  container.style.cssText = 'display: flex; align-items: center; gap: 10px;';

  const avatar = createAvatar(testimonial, config);
  if (avatar) container.appendChild(avatar);

  const info = el('div', 'tw-info');

  if (testimonial.customer_name) {
    const name = el('div', 'tw-name');
    name.style.cssText = 'font-weight: 600; font-size: 14px; color: var(--tw-fg);';
    name.textContent = testimonial.customer_name;
    info.appendChild(name);
  }

  if (config.show_company && testimonial.customer_company) {
    const company = el('div', 'tw-company');
    company.style.cssText = 'font-size: 12px; color: var(--tw-fg-muted);';
    company.textContent = testimonial.customer_company;
    info.appendChild(company);
  }

  container.appendChild(info);
  return container;
}

export function createDateLine(
  testimonial: WidgetTestimonial,
  config: WidgetConfig,
): HTMLElement | null {
  if (!config.show_dates) return null;

  const date = el('div', 'tw-date');
  date.style.cssText = 'font-size: 12px; color: var(--tw-fg-muted);';
  try {
    date.textContent = new Date(testimonial.created_at).toLocaleDateString(
      undefined,
      { year: 'numeric', month: 'short', day: 'numeric' },
    );
  } catch {
    date.textContent = testimonial.created_at;
  }
  return date;
}

export function createTestimonialCard(
  testimonial: WidgetTestimonial,
  config: WidgetConfig,
): HTMLElement {
  const card = el('div', 'tw-card');
  card.style.cssText = `
    background: var(--tw-card-bg); border: 1px solid var(--tw-card-border);
    border-radius: 12px; padding: 20px; box-shadow: var(--tw-card-shadow);
  `;

  const stars = createStars(testimonial.rating, config);
  if (stars) {
    stars.style.marginBottom = '12px';
    card.appendChild(stars);
  }

  if (testimonial.content) {
    const quote = el('p', 'tw-quote');
    quote.style.cssText =
      'font-size: 14px; line-height: 1.6; color: var(--tw-fg); margin-bottom: 16px;';
    quote.textContent = testimonial.content;
    card.appendChild(quote);
  }

  const dateLine = createDateLine(testimonial, config);
  if (dateLine) {
    dateLine.style.marginBottom = '12px';
    card.appendChild(dateLine);
  }

  card.appendChild(createAttribution(testimonial, config));

  return card;
}

/** Shorthand for document.createElement with a class */
export function el(tag: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
}
