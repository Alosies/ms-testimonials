/**
 * useMediaUrl Composable
 *
 * Generates CDN URLs for media with optional transformations.
 * Provides reactive URL generation that updates when inputs change.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMediaUrl } from '@/entities/media';
 *
 * const props = defineProps<{ storagePath: string }>();
 *
 * // Basic usage
 * const { url } = useMediaUrl(() => props.storagePath);
 *
 * // With transforms
 * const { url: thumbnailUrl } = useMediaUrl(
 *   () => props.storagePath,
 *   { width: 150, height: 150, fit: 'cover' }
 * );
 * </script>
 *
 * <template>
 *   <img :src="url" />
 *   <img :src="thumbnailUrl" class="thumbnail" />
 * </template>
 * ```
 */

import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import {
  buildImageKitUrl,
  buildThumbnailUrl,
  buildAvatarUrl,
  buildLogoUrl,
} from '../adapters/imagekit';
import type { ImageTransforms } from '../models';

// ============================================================
// MAIN COMPOSABLE
// ============================================================

/**
 * useMediaUrl composable
 *
 * Generates reactive CDN URLs for media files.
 *
 * @param storagePath - Storage path (reactive getter or ref)
 * @param transforms - Optional image transformations
 * @returns Object with computed url
 */
export function useMediaUrl(
  storagePath: MaybeRefOrGetter<string | undefined | null>,
  transforms?: ImageTransforms
) {
  /**
   * Computed URL that updates when storagePath or transforms change
   */
  const url = computed(() => {
    const path = toValue(storagePath);
    if (!path) return '';
    return buildImageKitUrl(path, transforms);
  });

  /**
   * Whether the URL is available (non-empty)
   */
  const hasUrl = computed(() => url.value !== '');

  return {
    url,
    hasUrl,
  };
}

// ============================================================
// PRESET COMPOSABLES
// ============================================================

/**
 * Generate thumbnail URL with preset transforms
 *
 * @param storagePath - Storage path (reactive getter or ref)
 * @param size - Thumbnail size in pixels (default: 150)
 * @returns Object with computed url
 *
 * @example
 * ```vue
 * const { url } = useMediaThumbnail(() => media.storagePath, 200);
 * ```
 */
export function useMediaThumbnail(
  storagePath: MaybeRefOrGetter<string | undefined | null>,
  size: number = 150
) {
  const url = computed(() => {
    const path = toValue(storagePath);
    if (!path) return '';
    return buildThumbnailUrl(path, size);
  });

  const hasUrl = computed(() => url.value !== '');

  return { url, hasUrl };
}

/**
 * Generate avatar URL with face-focused transforms
 *
 * @param storagePath - Storage path (reactive getter or ref)
 * @param size - Avatar size in pixels (default: 100)
 * @returns Object with computed url
 *
 * @example
 * ```vue
 * const { url } = useMediaAvatar(() => contact.avatarPath);
 * ```
 */
export function useMediaAvatar(
  storagePath: MaybeRefOrGetter<string | undefined | null>,
  size: number = 100
) {
  const url = computed(() => {
    const path = toValue(storagePath);
    if (!path) return '';
    return buildAvatarUrl(path, size);
  });

  const hasUrl = computed(() => url.value !== '');

  return { url, hasUrl };
}

/**
 * Generate logo URL preserving aspect ratio
 *
 * @param storagePath - Storage path (reactive getter or ref)
 * @param maxWidth - Maximum width in pixels (default: 200)
 * @returns Object with computed url
 *
 * @example
 * ```vue
 * const { url } = useMediaLogo(() => organization.logoPath, 300);
 * ```
 */
export function useMediaLogo(
  storagePath: MaybeRefOrGetter<string | undefined | null>,
  maxWidth: number = 200
) {
  const url = computed(() => {
    const path = toValue(storagePath);
    if (!path) return '';
    return buildLogoUrl(path, maxWidth);
  });

  const hasUrl = computed(() => url.value !== '');

  return { url, hasUrl };
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Non-reactive URL generation for one-off use
 *
 * @param storagePath - Storage path string
 * @param transforms - Optional transformations
 * @returns Generated URL or empty string
 */
export function getMediaUrl(
  storagePath: string | undefined | null,
  transforms?: ImageTransforms
): string {
  if (!storagePath) return '';
  return buildImageKitUrl(storagePath, transforms);
}

/**
 * Non-reactive thumbnail URL generation
 *
 * @param storagePath - Storage path string
 * @param size - Thumbnail size (default: 150)
 * @returns Generated URL or empty string
 */
export function getThumbnailUrl(
  storagePath: string | undefined | null,
  size: number = 150
): string {
  if (!storagePath) return '';
  return buildThumbnailUrl(storagePath, size);
}

/**
 * Non-reactive avatar URL generation
 *
 * @param storagePath - Storage path string
 * @param size - Avatar size (default: 100)
 * @returns Generated URL or empty string
 */
export function getAvatarUrl(
  storagePath: string | undefined | null,
  size: number = 100
): string {
  if (!storagePath) return '';
  return buildAvatarUrl(storagePath, size);
}

/**
 * Non-reactive logo URL generation
 *
 * @param storagePath - Storage path string
 * @param maxWidth - Max width (default: 200)
 * @returns Generated URL or empty string
 */
export function getLogoUrl(
  storagePath: string | undefined | null,
  maxWidth: number = 200
): string {
  if (!storagePath) return '';
  return buildLogoUrl(storagePath, maxWidth);
}
