/**
 * Pure function: Creates an entity URL slug from a title and entity ID
 * Combines a human-readable slug with the entity ID for URL generation
 *
 * @param title - The entity title (e.g., "Product Feedback Form")
 * @param entityId - The entity ID (e.g., "f7x8y9z0a1b2")
 * @returns Formatted URL slug (e.g., "product-feedback-form_f7x8y9z0a1b2")
 */

import { createSlugFromString } from './createSlugFromString';

export function createEntityUrlSlug(title: string, entityId: string): string {
  if (!entityId) {
    throw new Error('entityId is required');
  }

  const slug = title ? createSlugFromString(title) : '';

  // If no valid slug, just return the ID
  if (!slug) {
    return entityId;
  }

  return `${slug}_${entityId}`;
}
