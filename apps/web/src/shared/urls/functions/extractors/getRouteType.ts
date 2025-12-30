/**
 * Pure function: Determines the route type from a route path
 * @param path - The route path (e.g., "/acme-corp/forms/product-feedback_abc123")
 * @returns RouteType indicating the type of route
 */

import type { RouteType } from '../../models';

export function getRouteType(path: string): RouteType {
  if (!path || typeof path !== 'string') {
    return 'other';
  }

  const normalizedPath = path.toLowerCase();

  if (normalizedPath.includes('/forms/') || normalizedPath.endsWith('/forms')) {
    return 'form';
  }

  if (normalizedPath.includes('/testimonials/') || normalizedPath.endsWith('/testimonials')) {
    return 'testimonial';
  }

  if (normalizedPath.includes('/widgets/') || normalizedPath.endsWith('/widgets')) {
    return 'widget';
  }

  if (normalizedPath.includes('/settings')) {
    return 'settings';
  }

  if (normalizedPath.includes('/dashboard') || normalizedPath.match(/^\/[^/]+\/?$/)) {
    return 'dashboard';
  }

  return 'other';
}
