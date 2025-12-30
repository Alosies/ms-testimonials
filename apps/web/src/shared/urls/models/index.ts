/**
 * URL and Route Models
 * Types and interfaces for URL parsing, route analysis, and entity detection
 */

// Route analysis types
export type RouteType = 'form' | 'testimonial' | 'widget' | 'settings' | 'dashboard' | 'other';

export interface RouteContext {
  type: RouteType;
  formId: string | null;
  testimonialId: string | null;
  widgetId: string | null;
  organizationSlug: string | null;
}

// URL detection types
export interface UrlDetectionResult {
  entityType: 'form' | 'testimonial' | 'widget' | null;
  entityId: string | null;
  isValid: boolean;
}

// Entity URL information
export interface EntityUrlInfo {
  slug: string;
  entityId: string;
  isValid: boolean;
}

// Entity types for URL generation
export type EntityType = 'form' | 'testimonial' | 'widget';
