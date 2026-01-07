// ============================================================
// STORAGE ADAPTER TYPES
// ============================================================

export type StorageProvider = 'aws_s3' | 'gcs' | 'azure_blob';

export interface PresignParams {
  bucket: string;
  key: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;
  metadata?: Record<string, string>;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface ObjectMetadata {
  contentType: string;
  contentLength: number;
  etag?: string;
  lastModified?: Date;
  metadata?: Record<string, string>;
}

export interface StorageAdapter {
  readonly provider: StorageProvider;
  generatePresignedUploadUrl(params: PresignParams): Promise<PresignedUploadResult>;
  generatePresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number
  ): Promise<string>;
  deleteObject(bucket: string, key: string): Promise<void>;
  getObjectMetadata(bucket: string, key: string): Promise<ObjectMetadata>;
  objectExists(bucket: string, key: string): Promise<boolean>;
}

// ============================================================
// CDN ADAPTER TYPES
// ============================================================

export interface ImageTransforms {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  quality?: number;
  blur?: number;
  focus?: 'auto' | 'face' | 'center';
  cropMode?: 'maintain_ratio' | 'force' | 'at_max' | 'at_least';
}

export interface CDNConfig {
  baseUrl: string;
  pathPrefix?: string;
}

export interface CDNAdapter {
  getTransformUrl(storagePath: string, transforms?: ImageTransforms): string;
  getOriginalUrl(storagePath: string): string;
}

// ============================================================
// ENTITY TYPES & VALIDATION CONFIG
// ============================================================

export type EntityType =
  | 'organization_logo'
  | 'contact_avatar'
  | 'testimonial_video'
  | 'form_attachment';

export interface ValidationConfig {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
  targetTable: string;
}

export const ENTITY_VALIDATION_CONFIG: Record<EntityType, ValidationConfig> = {
  organization_logo: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFileSizeBytes: 5 * 1024 * 1024,
    targetTable: 'organizations',
  },
  contact_avatar: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeBytes: 2 * 1024 * 1024,
    targetTable: 'contacts',
  },
  testimonial_video: {
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxFileSizeBytes: 500 * 1024 * 1024,
    targetTable: 'testimonials',
  },
  form_attachment: {
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ],
    maxFileSizeBytes: 10 * 1024 * 1024,
    targetTable: 'form_submissions',
  },
};

// ============================================================
// MEDIA SERVICE TYPES
// ============================================================

export type MediaStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'deleted';

export interface UploadRequest {
  organizationId: string;
  entityType: EntityType;
  entityId?: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy?: string;
}

export interface UploadInitResult {
  mediaId: string;
  uploadUrl: string;
  storagePath: string;
  expiresAt: Date;
  headers: Record<string, string>;
}
