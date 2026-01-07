/**
 * ImageKit CDN Adapter
 *
 * Builds ImageKit URLs with transformation parameters.
 * Uses URL-based transformations for on-the-fly image processing.
 *
 * @see https://docs.imagekit.io/features/url-based-transformations
 */

import type { ImageTransforms } from '../models';

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * Get ImageKit URL endpoint from environment
 * Falls back to empty string if not configured
 */
function getImageKitEndpoint(): string {
  return import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';
}

/**
 * Get ImageKit path prefix for S3 integration
 * This maps to the S3 bucket in ImageKit settings
 */
function getImageKitPathPrefix(): string {
  return import.meta.env.VITE_IMAGEKIT_PATH_PREFIX || '';
}

// ============================================================
// TRANSFORM MAPPING
// ============================================================

/**
 * Map fit mode to ImageKit crop strategy
 */
function mapFitToCrop(fit?: ImageTransforms['fit']): string | undefined {
  const fitMap: Record<string, string> = {
    cover: 'c-maintain_ratio',
    contain: 'c-at_max',
    fill: 'c-force',
    inside: 'c-at_max',
    outside: 'c-at_least',
  };
  return fit ? fitMap[fit] : undefined;
}

/**
 * Map focus point to ImageKit focus parameter
 */
function mapFocus(focus?: ImageTransforms['focus']): string | undefined {
  const focusMap: Record<string, string> = {
    auto: 'fo-auto',
    face: 'fo-face',
    center: 'fo-center',
  };
  return focus ? focusMap[focus] : undefined;
}

/**
 * Map format to ImageKit format parameter
 */
function mapFormat(format?: ImageTransforms['format']): string | undefined {
  if (!format) return undefined;
  if (format === 'auto') return 'f-auto';
  return `f-${format}`;
}

// ============================================================
// URL BUILDERS
// ============================================================

/**
 * Build transformation string from options
 *
 * @param transforms - Image transformation options
 * @returns ImageKit transformation string (e.g., "w-200,h-200,c-maintain_ratio")
 */
export function buildTransformString(transforms: ImageTransforms): string {
  const parts: string[] = [];

  if (transforms.width) {
    parts.push(`w-${transforms.width}`);
  }

  if (transforms.height) {
    parts.push(`h-${transforms.height}`);
  }

  const crop = mapFitToCrop(transforms.fit);
  if (crop) {
    parts.push(crop);
  }

  const focus = mapFocus(transforms.focus);
  if (focus) {
    parts.push(focus);
  }

  const format = mapFormat(transforms.format);
  if (format) {
    parts.push(format);
  }

  if (transforms.quality) {
    parts.push(`q-${transforms.quality}`);
  }

  return parts.join(',');
}

/**
 * Build ImageKit URL with transformations
 *
 * @param storagePath - Full storage path from media record
 * @param transforms - Optional transformations to apply
 * @returns Full ImageKit URL
 *
 * @example
 * // Original image
 * buildImageKitUrl('org_123/organization_logo/2025/01/05/med_abc_20250105T143022.png')
 * // Returns: https://ik.imagekit.io/your_id/testimonials/org_123/organization_logo/2025/01/05/med_abc_20250105T143022.png
 *
 * @example
 * // With transforms
 * buildImageKitUrl('org_123/contact_avatar/2025/01/05/med_xyz_20250105T150000.jpg', {
 *   width: 100,
 *   height: 100,
 *   fit: 'cover',
 *   format: 'auto'
 * })
 * // Returns: https://ik.imagekit.io/your_id/testimonials/org_123/contact_avatar/.../tr:w-100,h-100,c-maintain_ratio,f-auto
 */
export function buildImageKitUrl(
  storagePath: string,
  transforms?: ImageTransforms
): string {
  const endpoint = getImageKitEndpoint();
  const pathPrefix = getImageKitPathPrefix();

  // If ImageKit is not configured, return empty string
  if (!endpoint) {
    console.warn('[ImageKit] URL endpoint not configured');
    return '';
  }

  // Build base path
  const basePath = pathPrefix
    ? `${endpoint}/${pathPrefix}/${storagePath}`
    : `${endpoint}/${storagePath}`;

  // Add transforms if provided
  if (transforms && Object.keys(transforms).length > 0) {
    const transformString = buildTransformString(transforms);
    if (transformString) {
      return `${basePath}?tr=${transformString}`;
    }
  }

  return basePath;
}

/**
 * Build thumbnail URL with preset transforms
 *
 * @param storagePath - Storage path from media record
 * @param size - Thumbnail size (default: 150)
 * @returns Thumbnail URL
 */
export function buildThumbnailUrl(
  storagePath: string,
  size: number = 150
): string {
  return buildImageKitUrl(storagePath, {
    width: size,
    height: size,
    fit: 'cover',
    format: 'auto',
  });
}

/**
 * Build avatar URL with preset transforms
 *
 * @param storagePath - Storage path from media record
 * @param size - Avatar size (default: 100)
 * @returns Avatar URL optimized for circular display
 */
export function buildAvatarUrl(
  storagePath: string,
  size: number = 100
): string {
  return buildImageKitUrl(storagePath, {
    width: size,
    height: size,
    fit: 'cover',
    focus: 'face',
    format: 'auto',
  });
}

/**
 * Build logo URL with preset transforms
 *
 * @param storagePath - Storage path from media record
 * @param maxWidth - Maximum width (default: 200)
 * @returns Logo URL preserving aspect ratio
 */
export function buildLogoUrl(
  storagePath: string,
  maxWidth: number = 200
): string {
  return buildImageKitUrl(storagePath, {
    width: maxWidth,
    fit: 'contain',
    format: 'auto',
  });
}
