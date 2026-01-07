import type { Context } from 'hono';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { getMediaService, type EntityType } from '@/shared/libs/media';
import { createMedia } from '@/entities/media';
import { env } from '@/shared/config/env';

/**
 * POST /media/presign
 *
 * Generate a presigned URL for direct upload to S3.
 *
 * Flow:
 * 1. Validate request (file size, MIME type, entity type)
 * 2. Generate storage path with embedded mediaId
 * 3. Generate presigned URL
 * 4. Create media record with status='pending'
 * 5. Return presigned URL and media info
 *
 * The frontend then uploads directly to S3 using the presigned URL.
 * After upload, S3 triggers Lambda which validates and calls the webhook.
 */
export async function generatePresignedUrl(c: Context) {
  try {
    const body = await c.req.json();
    const { filename, mimeType, fileSizeBytes, entityType, entityId } = body;

    // Get auth context
    const auth = c.get('auth');
    if (!auth?.organizationId) {
      return errorResponse(c, 'Organization context required', 400, 'NO_ORG_CONTEXT');
    }

    // Validate required fields
    if (!filename || !mimeType || !fileSizeBytes || !entityType) {
      return errorResponse(
        c,
        'Missing required fields: filename, mimeType, fileSizeBytes, entityType',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Get media service
    const mediaService = getMediaService();

    // Initialize upload (validates and generates presigned URL)
    let uploadResult;
    try {
      uploadResult = await mediaService.initUpload({
        organizationId: auth.organizationId,
        entityType: entityType as EntityType,
        entityId,
        filename,
        mimeType,
        fileSizeBytes,
        uploadedBy: auth.userId,
      });
    } catch (validationError) {
      return errorResponse(
        c,
        validationError instanceof Error ? validationError.message : 'Validation failed',
        400,
        'VALIDATION_ERROR'
      );
    }

    // Create media record in database with status='pending'
    const mediaRecord = await createMedia({
      organization_id: auth.organizationId,
      filename,
      mime_type: mimeType,
      file_size_bytes: fileSizeBytes,
      storage_provider: 'aws_s3',
      storage_bucket: env.S3_MEDIA_BUCKET,
      storage_path: uploadResult.storagePath,
      storage_region: env.AWS_REGION,
      entity_type: entityType as EntityType,
      entity_id: entityId,
      status: 'pending',
      uploaded_by: auth.userId,
    });

    if (!mediaRecord) {
      return errorResponse(c, 'Failed to create media record', 500, 'DB_ERROR');
    }

    // Return presigned URL and media info
    return successResponse(c, {
      mediaId: mediaRecord.id,
      uploadUrl: uploadResult.uploadUrl,
      storagePath: uploadResult.storagePath,
      expiresAt: uploadResult.expiresAt.toISOString(),
      headers: uploadResult.headers,
    });
  } catch (error) {
    console.error('Presign generation failed:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Unknown error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

export default generatePresignedUrl;
