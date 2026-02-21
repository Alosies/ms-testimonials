import type { WidgetConfig, WidgetTestimonial } from '../types';
import { createTestimonialCard, el } from './shared';

export function renderCarousel(
  testimonials: WidgetTestimonial[],
  config: WidgetConfig,
): HTMLElement {
  const container = el('div', 'tw-carousel');
  container.style.cssText = 'position: relative; padding: 8px;';

  let currentIndex = 0;

  const style = document.createElement('style');
  style.textContent = `
    .tw-carousel-track {
      overflow: hidden;
    }
    .tw-carousel-slide {
      transition: opacity 0.3s ease;
    }
    .tw-carousel-nav {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 16px;
    }
    .tw-carousel-btn {
      background: none; border: 1px solid var(--tw-border); border-radius: 50%;
      width: 36px; height: 36px; cursor: pointer; display: flex;
      align-items: center; justify-content: center; color: var(--tw-fg-muted);
      font-size: 18px; transition: background 0.2s;
    }
    .tw-carousel-btn:hover {
      background: var(--tw-nav-hover);
    }
    .tw-carousel-dots {
      display: flex; gap: 6px;
    }
    .tw-carousel-dot {
      width: 8px; height: 8px; border-radius: 50%; border: none;
      cursor: pointer; transition: background 0.2s; padding: 0;
    }
  `;
  container.appendChild(style);

  // Track
  const track = el('div', 'tw-carousel-track');
  const slides = testimonials.map((t) => {
    const slide = el('div', 'tw-carousel-slide');
    slide.appendChild(createTestimonialCard(t, config));
    return slide;
  });

  function showSlide(index: number) {
    slides.forEach((s, i) => {
      s.style.display = i === index ? 'block' : 'none';
    });
    dots.forEach((d, i) => {
      d.style.background =
        i === index ? 'var(--tw-dot-active)' : 'var(--tw-dot-inactive)';
    });
    currentIndex = index;
  }

  slides.forEach((s) => track.appendChild(s));
  container.appendChild(track);

  // Navigation
  const nav = el('div', 'tw-carousel-nav');

  const prevBtn = document.createElement('button');
  prevBtn.className = 'tw-carousel-btn';
  prevBtn.innerHTML = '‹';
  prevBtn.type = 'button';
  prevBtn.addEventListener('click', () => {
    showSlide(currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'tw-carousel-btn';
  nextBtn.innerHTML = '›';
  nextBtn.type = 'button';
  nextBtn.addEventListener('click', () => {
    showSlide(currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0);
  });

  // Dots
  const dotsContainer = el('div', 'tw-carousel-dots');
  const dots: HTMLElement[] = [];
  testimonials.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'tw-carousel-dot';
    dot.type = 'button';
    dot.addEventListener('click', () => showSlide(i));
    dots.push(dot);
    dotsContainer.appendChild(dot);
  });

  nav.appendChild(prevBtn);
  nav.appendChild(dotsContainer);
  nav.appendChild(nextBtn);
  container.appendChild(nav);

  // Touch/swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e: TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        showSlide(currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0);
      } else {
        showSlide(currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1);
      }
    }
  }, { passive: true });

  // Initialize
  showSlide(0);

  return container;
}
