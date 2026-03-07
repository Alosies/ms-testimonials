import type { WidgetConfig, WidgetTestimonial } from '../types';
import type { ToastPopupSettings } from '../types';
import { createAvatar, createStars, el } from './shared';

const SESSION_KEY = 'tw-toast-count';

export function renderToastPopup(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
): HTMLElement {
  const settings = config.settings as ToastPopupSettings;

  // Container is invisible — toast renders as fixed overlay
  const container = el('div', 'tw-toast-anchor');
  container.style.display = 'none';

  const style = document.createElement('style');
  style.textContent = `
    .tw-toast-overlay {
      position: fixed; z-index: 999999;
      max-width: 340px; width: calc(100vw - 32px);
      pointer-events: auto;
    }
    .tw-toast-overlay.tw-pos-bottom-left { bottom: 16px; left: 16px; }
    .tw-toast-overlay.tw-pos-bottom-right { bottom: 16px; right: 16px; }
    .tw-toast-overlay.tw-pos-top-left { top: 16px; left: 16px; }
    .tw-toast-overlay.tw-pos-top-right { top: 16px; right: 16px; }

    .tw-toast-card {
      background: var(--tw-card-bg); border: 1px solid var(--tw-card-border);
      border-radius: 12px; padding: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      position: relative;
    }
    .tw-toast-dismiss {
      position: absolute; top: 8px; right: 8px;
      background: none; border: none; cursor: pointer;
      color: var(--tw-fg-muted); font-size: 16px; line-height: 1;
      padding: 4px; border-radius: 4px;
    }
    .tw-toast-dismiss:hover { background: var(--tw-nav-hover); }
    .tw-toast-text {
      font-size: 14px; line-height: 1.5; color: var(--tw-fg);
      margin-bottom: 12px; padding-right: 20px;
      display: -webkit-box; -webkit-line-clamp: 3;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .tw-toast-attr {
      display: flex; align-items: center; gap: 8px;
    }
    .tw-toast-name {
      font-weight: 600; font-size: 13px; color: var(--tw-fg);
    }
    .tw-toast-company {
      font-size: 12px; color: var(--tw-fg-muted);
    }

    .tw-toast-slide-in-bottom { animation: tw-toast-slide-up 0.3s ease-out; }
    .tw-toast-slide-in-top { animation: tw-toast-slide-down 0.3s ease-out; }
    .tw-toast-fade-in { animation: tw-toast-fade 0.3s ease-out; }
    .tw-toast-hide { opacity: 0; transition: opacity 0.3s ease; }

    @keyframes tw-toast-slide-up {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes tw-toast-slide-down {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes tw-toast-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .tw-toast-slide-in-bottom,
      .tw-toast-slide-in-top,
      .tw-toast-fade-in {
        animation: none;
      }
      .tw-toast-hide {
        transition: none;
      }
    }
  `;

  // Get the shadow root to append overlay
  // We need to defer setup until the container is in the DOM
  requestAnimationFrame(() => {
    const shadow = container.parentNode;
    if (!shadow) return;

    shadow.appendChild(style);
    startToastRotation(shadow as ShadowRoot, testimonials, config, settings);
  });

  return container;
}

function startToastRotation(
  shadow: ShadowRoot,
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
  settings: ToastPopupSettings,
): void {
  // Check session count
  const sessionCount = getSessionCount(config);
  if (sessionCount >= settings.max_per_session) return;

  let currentIndex = 0;
  let shownCount = sessionCount;
  let overlay: HTMLElement | null = null;
  let userDismissed = false;

  function showToast() {
    if (userDismissed) return;
    if (shownCount >= settings.max_per_session) return;
    if (currentIndex >= testimonials.length) currentIndex = 0;

    const testimonial = testimonials[currentIndex];

    // Remove existing overlay
    if (overlay) overlay.remove();

    overlay = createToastOverlay(testimonial, config, settings, () => {
      userDismissed = true;
      hideToast();
    });

    shadow.appendChild(overlay);
    shownCount++;
    incrementSessionCount(config);
    currentIndex++;

    // Auto-hide after display_duration
    setTimeout(() => {
      hideToast();
      // Schedule next toast (skip if user explicitly dismissed)
      const pause = settings.rotation_interval - settings.display_duration;
      if (!userDismissed && shownCount < settings.max_per_session && currentIndex < testimonials.length) {
        setTimeout(showToast, Math.max(pause, 1000));
      }
    }, settings.display_duration);
  }

  function hideToast() {
    if (!overlay) return;
    overlay.classList.add('tw-toast-hide');
    const ref = overlay;
    setTimeout(() => ref.remove(), 300);
    overlay = null;
  }

  // Start after initial delay
  setTimeout(showToast, settings.delay_before_first);
}

function createToastOverlay(
  testimonial: WidgetTestimonial,
  config: WidgetConfig,
  settings: ToastPopupSettings,
  onDismiss: () => void,
): HTMLElement {
  const posClass = `tw-pos-${settings.position}`;
  const isBottom = settings.position.startsWith('bottom');
  const animClass = settings.animate_in === 'fade'
    ? 'tw-toast-fade-in'
    : isBottom ? 'tw-toast-slide-in-bottom' : 'tw-toast-slide-in-top';

  const overlay = el('div', `tw-toast-overlay ${posClass} ${animClass}`);

  const card = el('div', 'tw-toast-card');

  // Dismiss button
  if (settings.show_dismiss) {
    const dismiss = document.createElement('button');
    dismiss.className = 'tw-toast-dismiss';
    dismiss.type = 'button';
    dismiss.innerHTML = '×';
    dismiss.addEventListener('click', (e) => {
      e.stopPropagation();
      onDismiss();
    });
    card.appendChild(dismiss);
  }

  // Stars
  const stars = createStars(testimonial.rating, config);
  if (stars) {
    stars.style.marginBottom = '8px';
    card.appendChild(stars);
  }

  // Quote text (clamped to 3 lines)
  if (testimonial.content) {
    const text = el('div', 'tw-toast-text');
    text.textContent = `"${testimonial.content}"`;
    card.appendChild(text);
  }

  // Attribution
  const attr = el('div', 'tw-toast-attr');
  const avatar = createAvatar(testimonial, config);
  if (avatar) {
    avatar.style.cssText += 'width: 32px; height: 32px;';
    attr.appendChild(avatar);
  }

  const info = el('div', 'tw-toast-info');
  if (testimonial.customer_name) {
    const name = el('div', 'tw-toast-name');
    name.textContent = testimonial.customer_name;
    info.appendChild(name);
  }
  if (config.show_company && testimonial.customer_company) {
    const company = el('div', 'tw-toast-company');
    company.textContent = testimonial.customer_company;
    info.appendChild(company);
  }
  attr.appendChild(info);
  card.appendChild(attr);

  overlay.appendChild(card);
  return overlay;
}

function getSessionCount(config: WidgetConfig): number {
  try {
    return parseInt(sessionStorage.getItem(`${SESSION_KEY}-${config.id}`) ?? '0', 10);
  } catch {
    return 0;
  }
}

function incrementSessionCount(config: WidgetConfig): void {
  try {
    const current = getSessionCount(config);
    sessionStorage.setItem(`${SESSION_KEY}-${config.id}`, String(current + 1));
  } catch {
    // sessionStorage unavailable — silently continue
  }
}
