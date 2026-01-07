/**
 * Media Entity
 *
 * Public API for media uploads and URL generation.
 *
 * @example
 * ```typescript
 * // Upload composable
 * import { useUploadMedia } from '@/entities/media';
 *
 * const { upload, progress, status, error } = useUploadMedia({
 *   entityType: 'organization_logo',
 *   onSuccess: (result) => console.log('Uploaded:', result.mediaId),
 * });
 *
 * // URL composables
 * import { useMediaUrl, useMediaAvatar } from '@/entities/media';
 *
 * const { url } = useMediaUrl(() => storagePath);
 * const { url: avatarUrl } = useMediaAvatar(() => avatarPath);
 *
 * // Types
 * import type { MediaEntityType, UploadResult } from '@/entities/media';
 * ```
 */

// ============================================================
// COMPOSABLES
// ============================================================

export {
  // Upload
  useUploadMedia,
  // URL (reactive)
  useMediaUrl,
  useMediaThumbnail,
  useMediaAvatar,
  useMediaLogo,
  // URL (non-reactive)
  getMediaUrl,
  getThumbnailUrl,
  getAvatarUrl,
  getLogoUrl,
} from './composables';

// ============================================================
// API
// ============================================================

export { useApiForMedia } from './api';

// ============================================================
// ADAPTERS
// ============================================================

export {
  buildImageKitUrl,
  buildThumbnailUrl,
  buildAvatarUrl,
  buildLogoUrl,
  buildTransformString,
} from './adapters';

// ============================================================
// TYPES
// ============================================================

export type {
  // Entity types
  MediaEntityType,
  MediaStatus,
  Media,
  // Validation
  EntityValidationConfig,
  // Upload state
  UploadProgress,
  UploadStatus,
  UploadResult,
  UploadError,
  // Composable options
  UseUploadMediaOptions,
  // API types
  PresignRequest,
  PresignResponse,
  // CDN types
  ImageTransforms,
  UseMediaUrlOptions,
} from './models';

// ============================================================
// COMPONENTS
// ============================================================

export { MediaUploader, ImagePreview } from './components';

// ============================================================
// CONSTANTS
// ============================================================

export { ENTITY_VALIDATION_CONFIG } from './models';
