/**
 * Entity URL Generator Functions
 * Convenience functions for generating URLs for specific entity types
 */

import { createEntityUrlSlug } from './createEntityUrlSlug';
import type { EntityType } from '../../models';

/**
 * Creates a full entity URL path
 * @param entityType - The type of entity (form, testimonial, widget)
 * @param title - The entity title for slug generation
 * @param entityId - The entity ID
 * @returns Full URL path (e.g., "/forms/product-feedback_f7x8y9z0a1b2")
 */
export function createEntityUrl(entityType: EntityType, title: string, entityId: string): string {
  const urlSlug = createEntityUrlSlug(title, entityId);
  const pluralType = `${entityType}s`; // form -> forms, widget -> widgets

  return `/${pluralType}/${urlSlug}`;
}

/**
 * Creates a form URL path
 * @param name - The form name
 * @param formId - The form ID
 * @returns Form URL path (e.g., "/forms/product-feedback_f7x8y9z0a1b2")
 */
export function createFormUrl(name: string, formId: string): string {
  return createEntityUrl('form', name, formId);
}

/**
 * Creates a testimonial URL path
 * @param customerName - The customer name
 * @param testimonialId - The testimonial ID
 * @returns Testimonial URL path (e.g., "/testimonials/john-doe_t1a2b3c4d5e6")
 */
export function createTestimonialUrl(customerName: string, testimonialId: string): string {
  return createEntityUrl('testimonial', customerName, testimonialId);
}

/**
 * Creates a widget URL path
 * @param name - The widget name
 * @param widgetId - The widget ID
 * @returns Widget URL path (e.g., "/widgets/homepage-wall_w5d6e7f8g9h0")
 */
export function createWidgetUrl(name: string, widgetId: string): string {
  return createEntityUrl('widget', name, widgetId);
}

/**
 * Creates a full organization-scoped entity URL
 * @param orgSlug - The organization slug
 * @param entityType - The type of entity
 * @param title - The entity title
 * @param entityId - The entity ID
 * @returns Full URL (e.g., "/acme-corp/forms/product-feedback_f7x8y9z0a1b2")
 */
export function createOrgEntityUrl(
  orgSlug: string,
  entityType: EntityType,
  title: string,
  entityId: string
): string {
  const entityPath = createEntityUrl(entityType, title, entityId);
  return `/${orgSlug}${entityPath}`;
}

/**
 * Creates an organization-scoped form URL
 */
export function createOrgFormUrl(orgSlug: string, name: string, formId: string): string {
  return createOrgEntityUrl(orgSlug, 'form', name, formId);
}

/**
 * Creates an organization-scoped testimonial URL
 */
export function createOrgTestimonialUrl(
  orgSlug: string,
  customerName: string,
  testimonialId: string
): string {
  return createOrgEntityUrl(orgSlug, 'testimonial', customerName, testimonialId);
}

/**
 * Creates an organization-scoped widget URL
 */
export function createOrgWidgetUrl(orgSlug: string, name: string, widgetId: string): string {
  return createOrgEntityUrl(orgSlug, 'widget', name, widgetId);
}
