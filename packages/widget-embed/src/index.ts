import { initWidgets, observeDynamicWidgets } from './loader';

/**
 * Testimonials Widget Embed Script
 *
 * Usage:
 *   <div data-testimonials-widget="wall_of_love" data-widget-id="WIDGET_ID"></div>
 *   <script src="https://your-domain/embed/widgets.js" async></script>
 */

function boot() {
  initWidgets();
  observeDynamicWidgets();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
