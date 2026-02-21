import { el } from './shared';

export function createLoadingState(): HTMLElement {
  const container = el('div', 'tw-loading');
  container.style.cssText = `
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 40px 20px; gap: 12px;
  `;

  const spinner = el('div', 'tw-spinner');
  spinner.style.cssText = `
    width: 24px; height: 24px; border: 2px solid var(--tw-border);
    border-top-color: var(--tw-fg-muted); border-radius: 50%;
    animation: tw-spin 0.8s linear infinite;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes tw-spin {
      to { transform: rotate(360deg); }
    }
  `;

  container.appendChild(style);
  container.appendChild(spinner);
  return container;
}

export function createEmptyState(): HTMLElement {
  const container = el('div', 'tw-empty');
  container.style.cssText = `
    text-align: center; padding: 40px 20px;
    color: var(--tw-fg-muted); font-size: 14px;
  `;
  container.textContent = 'No testimonials to display.';
  return container;
}
