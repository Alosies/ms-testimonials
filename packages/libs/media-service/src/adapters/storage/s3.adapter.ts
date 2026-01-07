import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  StorageAdapter,
  StorageProvider,
  PresignParams,
  PresignedUploadResult,
  ObjectMetadata,
} from '../../types';

export interface S3AdapterConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string; // For S3-compatible services (MinIO, etc.)
}

const DEFAULT_PRESIGN_EXPIRY = 15 * 60; // 15 minutes

export class S3StorageAdapter implements StorageAdapter {
  readonly provider: StorageProvider = 'aws_s3';

  private client: S3Client;
  private region: string;

  constructor(config: S3AdapterConfig) {
    this.region = config.region;

    const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
      region: config.region,
    };

    // Use explicit credentials if provided, otherwise use default credential chain
    if (config.accessKeyId && config.secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    // Custom endpoint for S3-compatible services
    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = true; // Required for MinIO, etc.
    }

    this.client = new S3Client(clientConfig);
  }

  async generatePresignedUploadUrl(params: PresignParams): Promise<PresignedUploadResult> {
    const expiresIn = params.expiresInSeconds ?? DEFAULT_PRESIGN_EXPIRY;

    const command = new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
      Metadata: params.metadata,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': params.contentType,
        'Content-Length': String(params.contentLength),
      },
      expiresAt,
    };
  }

  async generatePresignedDownloadUrl(
    bucket: string,
    key: string,
    expiresInSeconds?: number
  ): Promise<string> {
    const expiresIn = expiresInSeconds ?? DEFAULT_PRESIGN_EXPIRY;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async getObjectMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    return {
      contentType: response.ContentType ?? 'application/octet-stream',
      contentLength: response.ContentLength ?? 0,
      etag: response.ETag,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }

  async objectExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.getObjectMetadata(bucket, key);
      return true;
    } catch (error: unknown) {
      // Check if it's a "not found" error
      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        (error.name === 'NotFound' || error.name === 'NoSuchKey')
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the S3 region for this adapter
   */
  getRegion(): string {
    return this.region;
  }
}
