import type { CDNAdapter, CDNConfig, ImageTransforms } from '../../types';

export interface ImageKitConfig extends CDNConfig {
  // ImageKit-specific config can be added here
}

/**
 * ImageKit CDN Adapter
 *
 * Generates URLs for ImageKit's image transformation service.
 * ImageKit is configured to use S3 as origin storage.
 *
 * Configuration comes from environment variables:
 * - VITE_CDN_BASE_URL / CDN_BASE_URL
 * - VITE_CDN_PATH_PREFIX / CDN_PATH_PREFIX (optional)
 *
 * URL Pattern:
 * https://ik.imagekit.io/{imagekit_id}{pathPrefix}/{storage_path}?tr={transforms}
 */
export class ImageKitCDNAdapter implements CDNAdapter {
  private baseUrl: string;
  private pathPrefix: string;

  constructor(config: ImageKitConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.pathPrefix = config.pathPrefix ?? '';
  }

  getTransformUrl(storagePath: string, transforms?: ImageTransforms): string {
    const url = this.buildBaseUrl(storagePath);

    if (!transforms || Object.keys(transforms).length === 0) {
      return url;
    }

    const params = this.buildTransformParams(transforms);
    return `${url}?tr=${params}`;
  }

  getOriginalUrl(storagePath: string): string {
    return this.buildBaseUrl(storagePath);
  }

  private buildBaseUrl(storagePath: string): string {
    // Remove leading slash from storage path if present
    const cleanPath = storagePath.replace(/^\//, '');
    return `${this.baseUrl}${this.pathPrefix}/${cleanPath}`;
  }

  /**
   * Build ImageKit transform parameters string
   *
   * Reference: https://docs.imagekit.io/features/image-transformations
   */
  private buildTransformParams(transforms: ImageTransforms): string {
    const parts: string[] = [];

    if (transforms.width) {
      parts.push(`w-${transforms.width}`);
    }

    if (transforms.height) {
      parts.push(`h-${transforms.height}`);
    }

    if (transforms.fit) {
      parts.push(`c-${this.mapFit(transforms.fit)}`);
    }

    if (transforms.cropMode) {
      parts.push(`cm-${transforms.cropMode}`);
    }

    if (transforms.focus) {
      parts.push(`fo-${transforms.focus}`);
    }

    if (transforms.format) {
      if (transforms.format === 'auto') {
        parts.push('f-auto');
      } else {
        parts.push(`f-${transforms.format}`);
      }
    }

    if (transforms.quality) {
      parts.push(`q-${transforms.quality}`);
    }

    if (transforms.blur) {
      parts.push(`bl-${transforms.blur}`);
    }

    return parts.join(',');
  }

  /**
   * Map generic fit values to ImageKit crop modes
   */
  private mapFit(
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  ): string {
    const fitMap: Record<string, string> = {
      cover: 'maintain_ratio',
      contain: 'at_max',
      fill: 'force',
      inside: 'at_max',
      outside: 'at_least',
    };
    return fitMap[fit] ?? 'maintain_ratio';
  }
}

// ============================================================
// TRANSFORM PRESETS
// ============================================================

/**
 * Common transform presets for reuse
 */
export const TRANSFORM_PRESETS = {
  /** Thumbnail: 150x150, cover crop, auto format */
  thumbnail: {
    width: 150,
    height: 150,
    fit: 'cover' as const,
    format: 'auto' as const,
  },

  /** Avatar: 100x100, cover crop, face focus, auto format */
  avatar: {
    width: 100,
    height: 100,
    fit: 'cover' as const,
    focus: 'face' as const,
    format: 'auto' as const,
  },

  /** Logo: max 200px width, preserve aspect, auto format */
  logo: {
    width: 200,
    fit: 'contain' as const,
    format: 'auto' as const,
  },

  /** Card: 400x300, cover crop, auto format */
  card: {
    width: 400,
    height: 300,
    fit: 'cover' as const,
    format: 'auto' as const,
  },

  /** Preview: 800px max width, auto format */
  preview: {
    width: 800,
    fit: 'inside' as const,
    format: 'auto' as const,
  },
} as const;
