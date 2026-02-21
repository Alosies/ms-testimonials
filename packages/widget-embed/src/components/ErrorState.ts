import { el } from './shared';

export function createErrorState(): HTMLElement {
  const container = el('div', 'tw-error');
  container.style.cssText = `
    text-align: center; padding: 40px 20px;
    color: var(--tw-fg-muted); font-size: 14px;
  `;
  container.textContent = 'Unable to load testimonials.';
  return container;
}
