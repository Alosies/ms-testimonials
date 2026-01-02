/**
 * URL Management
 * Pure functions and utilities for URL generation, parsing, and validation
 *
 * Key Principle: Slugs are cosmetic. Only the ID matters for data fetching.
 *
 * URL Pattern: /{org_slug}/{entity_type}/{readable_slug}_{entity_id}
 * Resolution: Extract ID from after the last underscore, query by primary key
 *
 * @example
 * // Generating URLs
 * import { createOrgFormUrl, createEntityUrlSlug } from '@/shared/urls';
 *
 * const url = createOrgFormUrl('acme-corp', 'Product Feedback', 'f7x8y9z0a1b2');
 * // Result: "/acme-corp/forms/product-feedback_f7x8y9z0a1b2"
 *
 * @example
 * // Resolving URLs (extracting ID)
 * import { extractEntityIdFromSlug } from '@/shared/urls';
 *
 * const result = extractEntityIdFromSlug('product-feedback_f7x8y9z0a1b2');
 * // Result: { slug: "product-feedback", entityId: "f7x8y9z0a1b2", isValid: true }
 * // Use result.entityId for data fetching - slug is ignored
 */

// Pure functions
export {
  extractEntityIdFromSlug,
  extractOrganizationSlug,
  getRouteType,
  isValidEntityUrl,
  createSlugFromString,
  createEntityUrlSlug,
  createEntityUrl,
  createFormUrl,
  createTestimonialUrl,
  createWidgetUrl,
  createOrgEntityUrl,
  createOrgFormUrl,
  createOrgTestimonialUrl,
  createOrgWidgetUrl,
  createPublicFormUrl,
} from './functions';

// Types and models
export type {
  EntityUrlInfo,
  EntityType,
  RouteType,
  RouteContext,
  UrlDetectionResult,
} from './models';
