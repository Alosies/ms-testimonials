/**
 * Media Entity Models
 *
 * Type definitions for media uploads and management.
 * These types are used by composables and components.
 */

// ============================================================
// ENTITY TYPES (Match database)
// ============================================================

/**
 * Supported entity types for media uploads.
 * Must match media_entity_types table in database.
 */
export type MediaEntityType =
  | 'organization_logo'
  | 'contact_avatar'
  | 'testimonial_video'
  | 'form_attachment';

/**
 * Media processing status.
 * Matches the status column in media table.
 */
export type MediaStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'deleted';

// ============================================================
// VALIDATION CONFIG (Mirror of backend)
// ============================================================

/**
 * Validation configuration for each entity type.
 * Used for client-side validation before upload.
 */
export interface EntityValidationConfig {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
  displayName: string;
}

/**
 * Client-side validation config per entity type.
 * Keep in sync with media_entity_types seed data.
 */
export const ENTITY_VALIDATION_CONFIG: Record<
  MediaEntityType,
  EntityValidationConfig
> = {
  organization_logo: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
    displayName: 'Organization Logo',
  },
  contact_avatar: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeBytes: 2 * 1024 * 1024, // 2MB
    displayName: 'Contact Avatar',
  },
  testimonial_video: {
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
    displayName: 'Testimonial Video',
  },
  form_attachment: {
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ],
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    displayName: 'Form Attachment',
  },
};

// ============================================================
// MEDIA RECORD
// ============================================================

/**
 * Media record as returned from API/GraphQL
 */
export interface Media {
  id: string;
  organizationId: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  storageProvider: string;
  storageBucket: string;
  storagePath: string;
  storageRegion?: string;
  entityType: MediaEntityType;
  entityId?: string;
  status: MediaStatus;
  errorMessage?: string;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// UPLOAD STATE
// ============================================================

/**
 * Upload progress state
 */
export interface UploadProgress {
  /** Bytes uploaded so far */
  loaded: number;
  /** Total bytes to upload */
  total: number;
  /** Progress percentage (0-100) */
  percentage: number;
}

/**
 * Upload status
 */
export type UploadStatus =
  | 'idle'
  | 'validating'
  | 'requesting_url'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error';

/**
 * Upload result on success
 */
export interface UploadResult {
  /** Media record ID */
  mediaId: string;
  /** Storage path for CDN URL construction */
  storagePath: string;
  /** Original filename */
  filename: string;
}

/**
 * Upload error details
 */
export interface UploadError {
  /** Error code for programmatic handling */
  code:
    | 'VALIDATION_ERROR'
    | 'PRESIGN_ERROR'
    | 'UPLOAD_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  /** Human-readable error message */
  message: string;
  /** Additional details */
  details?: unknown;
}

// ============================================================
// API TYPES (Re-exported from API schemas for type safety)
// ============================================================

/**
 * API request/response types - imported from API schemas (per ADR-021).
 * This ensures frontend types stay in sync with backend contracts.
 */
export type {
  PresignRequest,
  PresignResponse,
  EntityType as ApiEntityType,
  MediaStatus as ApiMediaStatus,
} from '@api/shared/schemas/media';

// ============================================================
// COMPOSABLE OPTIONS
// ============================================================

/**
 * Options for useUploadMedia composable
 */
export interface UseUploadMediaOptions {
  /** Entity type for this upload context */
  entityType: MediaEntityType;
  /** Entity ID to associate upload with (optional) */
  entityId?: string;
  /** Callback on successful upload */
  onSuccess?: (result: UploadResult) => void;
  /** Callback on upload error */
  onError?: (error: UploadError) => void;
  /** Callback on progress update */
  onProgress?: (progress: UploadProgress) => void;
}

// ============================================================
// CDN/TRANSFORM TYPES
// ============================================================

/**
 * Image transformation options for CDN URLs
 */
export interface ImageTransforms {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Resize fit mode */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  /** Output format */
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  /** Quality (1-100) */
  quality?: number;
  /** Focus point for cropping */
  focus?: 'auto' | 'face' | 'center';
}

/**
 * Options for useMediaUrl composable
 */
export interface UseMediaUrlOptions {
  /** Storage path from media record */
  storagePath: string;
  /** Optional transformations */
  transforms?: ImageTransforms;
}
