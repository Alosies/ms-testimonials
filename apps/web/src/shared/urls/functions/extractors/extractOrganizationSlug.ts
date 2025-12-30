/**
 * Pure function: Extracts organization slug from a route path
 * Assumes URL pattern: /{org_slug}/...
 *
 * @param path - The route path (e.g., "/acme-corp/forms/product-feedback_abc123")
 * @returns Organization slug or null if not found
 */

export function extractOrganizationSlug(path: string): string | null {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Remove leading slash and split
  const segments = path.replace(/^\/+/, '').split('/');

  if (segments.length === 0 || !segments[0]) {
    return null;
  }

  // First segment is the organization slug
  // Skip if it's a known public route prefix
  const publicPrefixes = ['f', 'w', 'embed', 'login', 'signup', 'forgot-password', 'reset-password'];

  if (publicPrefixes.includes(segments[0].toLowerCase())) {
    return null;
  }

  return segments[0];
}
