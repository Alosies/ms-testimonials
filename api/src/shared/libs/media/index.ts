import { env } from '@/shared/config/env';
import { MediaService } from './core/MediaService';
import { S3StorageAdapter } from './adapters/s3.adapter';

let mediaService: MediaService | null = null;

/**
 * Get the singleton MediaService instance
 *
 * Creates the service on first call with configuration from environment.
 * Subsequent calls return the same instance.
 *
 * Note: This service handles storage operations only (presign, delete, metadata).
 * CDN URL generation is handled by the frontend using ImageKit Vue SDK.
 */
export function getMediaService(): MediaService {
  if (!mediaService) {
    // S3 adapter uses AWS SDK default credential chain if explicit creds not provided
    // This supports: AWS_PROFILE, IAM roles, ~/.aws/credentials, etc.
    const s3Adapter = new S3StorageAdapter({
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY_ID || undefined,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || undefined,
    });

    mediaService = new MediaService({
      storageAdapter: s3Adapter,
      bucket: env.S3_MEDIA_BUCKET,
      region: env.AWS_REGION,
    });

    console.log('📦 MediaService initialized (storage-only)', {
      bucket: env.S3_MEDIA_BUCKET,
      region: env.AWS_REGION,
    });
  }

  return mediaService;
}

/**
 * Reset the media service instance (useful for testing)
 */
export function resetMediaService(): void {
  mediaService = null;
}

// Re-export types and utilities for convenience
export { MediaService } from './core/MediaService';
export type { MediaServiceConfig } from './core/MediaService';
export { S3StorageAdapter } from './adapters/s3.adapter';
export type { S3AdapterConfig } from './adapters/s3.adapter';
export { PathBuilder, pathBuilder } from './core/pathBuilder';
export type { PathBuilderConfig } from './core/pathBuilder';
export {
  validateUploadRequest,
  getValidationConfig,
  isValidEntityType,
  getValidEntityTypes,
  formatFileSize,
} from './core/validators';
export type { ValidationResult } from './core/validators';
export * from './types';
