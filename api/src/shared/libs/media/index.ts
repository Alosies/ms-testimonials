import {
  MediaService,
  S3StorageAdapter,
  ImageKitCDNAdapter,
} from '@testimonials/media-service';
import { env } from '@/shared/config/env';

let mediaService: MediaService | null = null;

/**
 * Get the singleton MediaService instance
 *
 * Creates the service on first call with configuration from environment.
 * Subsequent calls return the same instance.
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

    const cdnAdapter = new ImageKitCDNAdapter({
      baseUrl: env.CDN_BASE_URL || `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`,
      pathPrefix: env.CDN_PATH_PREFIX || '',
    });

    mediaService = new MediaService({
      storageAdapter: s3Adapter,
      cdnAdapter: cdnAdapter,
      bucket: env.S3_MEDIA_BUCKET,
      region: env.AWS_REGION,
    });

    console.log('📦 MediaService initialized', {
      bucket: env.S3_MEDIA_BUCKET,
      region: env.AWS_REGION,
      cdnConfigured: !!env.CDN_BASE_URL,
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

export { MediaService } from '@testimonials/media-service';
