/**
 * Pure function: Validates if a URL slug follows the expected entity URL format
 * A valid entity URL slug has the pattern: {slug}_{entityId}
 *
 * @param urlSlug - The URL slug to validate
 * @returns true if the URL slug is valid, false otherwise
 */

import { extractEntityIdFromSlug } from '../extractors';

export function isValidEntityUrl(urlSlug: string): boolean {
  const result = extractEntityIdFromSlug(urlSlug);
  return result?.isValid ?? false;
}
