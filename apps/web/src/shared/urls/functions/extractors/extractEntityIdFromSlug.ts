/**
 * Pure function: Extracts entity ID from a URL slug that follows the pattern: slug_{{entityId}}
 * The slug portion is purely cosmetic and ignored during resolution.
 * Only the entityId (after the last underscore) is used for data fetching.
 *
 * @param urlSlug - The URL slug containing the entity ID (e.g., "product-feedback_f7x8y9z0a1b2")
 * @returns EntityUrlInfo object with extraction results, or null if invalid input
 */

import type { EntityUrlInfo } from '../../models';

export function extractEntityIdFromSlug(urlSlug: string): EntityUrlInfo | null {
  if (!urlSlug || typeof urlSlug !== 'string') {
    return null;
  }

  // Find the last underscore in the slug
  const lastUnderscoreIndex = urlSlug.lastIndexOf('_');

  if (lastUnderscoreIndex === -1 || lastUnderscoreIndex === urlSlug.length - 1) {
    return {
      slug: urlSlug,
      entityId: '',
      isValid: false,
    };
  }

  const slug = urlSlug.substring(0, lastUnderscoreIndex);
  const entityId = urlSlug.substring(lastUnderscoreIndex + 1);

  // Validate: entityId should match database NanoID format
  // DB alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
  // (excludes 0, O, I, l for readability - no hyphens or underscores)
  const isValidEntityId = entityId.length > 0 && /^[a-zA-Z0-9]+$/.test(entityId);

  return {
    slug,
    entityId,
    isValid: isValidEntityId,
  };
}
