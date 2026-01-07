import type {
  StorageAdapter,
  CDNAdapter,
  UploadRequest,
  UploadInitResult,
  EntityType,
  ImageTransforms,
} from '../types';
import { PathBuilder } from './pathBuilder';
import { validateUploadRequest } from './validators';

export interface MediaServiceConfig {
  storageAdapter: StorageAdapter;
  cdnAdapter: CDNAdapter;
  bucket: string;
  region?: string;
}

/**
 * MediaService - Main orchestrator for media uploads
 *
 * Responsibilities:
 * - Generate presigned URLs for direct uploads
 * - Build storage paths with embedded media IDs
 * - Validate upload requests
 * - Generate CDN URLs for serving media
 */
export class MediaService {
  private storage: StorageAdapter;
  private cdn: CDNAdapter;
  private pathBuilder: PathBuilder;
  private bucket: string;
  private region?: string;

  constructor(config: MediaServiceConfig) {
    this.storage = config.storageAdapter;
    this.cdn = config.cdnAdapter;
    this.bucket = config.bucket;
    this.region = config.region;
    this.pathBuilder = new PathBuilder();
  }

  /**
   * Initialize an upload by generating a presigned URL
   *
   * Flow:
   * 1. Validate the upload request
   * 2. Build the storage path (with embedded mediaId)
   * 3. Generate presigned URL
   * 4. Return data for API to create media record
   *
   * @throws Error if validation fails
   */
  async initUpload(request: UploadRequest): Promise<UploadInitResult> {
    // Validate the upload request
    const validation = validateUploadRequest({
      filename: request.filename,
      mimeType: request.mimeType,
      fileSizeBytes: request.fileSizeBytes,
      entityType: request.entityType,
    });

    if (!validation.valid) {
      throw new Error(`Upload validation failed: ${validation.errors.join(', ')}`);
    }

    // Build storage path with embedded mediaId
    const { mediaId, storagePath } = this.pathBuilder.buildPath({
      organizationId: request.organizationId,
      entityType: request.entityType,
      filename: request.filename,
    });

    // Generate presigned URL
    const presign = await this.storage.generatePresignedUploadUrl({
      bucket: this.bucket,
      key: storagePath,
      contentType: request.mimeType,
      contentLength: request.fileSizeBytes,
      expiresInSeconds: 15 * 60, // 15 minutes
      metadata: {
        'x-media-id': mediaId,
        'x-entity-type': request.entityType,
        'x-organization-id': request.organizationId,
      },
    });

    return {
      mediaId,
      uploadUrl: presign.uploadUrl,
      storagePath,
      expiresAt: presign.expiresAt,
      headers: presign.headers,
    };
  }

  /**
   * Get a CDN URL for a media file
   *
   * @param storagePath - The storage path of the media file
   * @param transforms - Optional image transforms
   */
  getMediaUrl(storagePath: string, transforms?: ImageTransforms): string {
    if (transforms && Object.keys(transforms).length > 0) {
      return this.cdn.getTransformUrl(storagePath, transforms);
    }
    return this.cdn.getOriginalUrl(storagePath);
  }

  /**
   * Get a presigned download URL for a private file
   *
   * Use this for files that shouldn't go through CDN
   * (e.g., temporary downloads, internal use)
   */
  async getDownloadUrl(
    storagePath: string,
    expiresInSeconds?: number
  ): Promise<string> {
    return this.storage.generatePresignedDownloadUrl(
      this.bucket,
      storagePath,
      expiresInSeconds
    );
  }

  /**
   * Delete a media file from storage
   */
  async deleteMedia(storagePath: string): Promise<void> {
    await this.storage.deleteObject(this.bucket, storagePath);
  }

  /**
   * Check if a media file exists
   */
  async mediaExists(storagePath: string): Promise<boolean> {
    return this.storage.objectExists(this.bucket, storagePath);
  }

  /**
   * Parse media ID from a storage path
   */
  parseMediaId(storagePath: string): string | null {
    return this.pathBuilder.parseMediaId(storagePath);
  }

  /**
   * Parse entity type from a storage path
   */
  parseEntityType(storagePath: string): EntityType | null {
    return this.pathBuilder.parseEntityType(storagePath);
  }

  /**
   * Get the bucket name
   */
  getBucket(): string {
    return this.bucket;
  }

  /**
   * Get the storage region
   */
  getRegion(): string | undefined {
    return this.region;
  }
}
