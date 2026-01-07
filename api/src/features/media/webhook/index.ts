import type { Context } from 'hono';
import crypto from 'crypto';
import { successResponse, errorResponse } from '@/shared/utils/http';
import { findMediaByStoragePath, updateMediaStatus } from '@/entities/media';
import { env } from '@/shared/config/env';

/**
 * POST /webhooks/s3-media-upload
 *
 * Webhook endpoint called by Lambda after S3 upload completes.
 *
 * Flow:
 * 1. Verify HMAC signature (Lambda signs with shared secret)
 * 2. Find media record by storage path
 * 3. Update status based on validation result
 * 4. Store dimensions if provided (for images)
 *
 * Lambda calls this after:
 * - Validating file content (MIME type, size)
 * - Extracting image dimensions (if applicable)
 */
export async function handleS3Webhook(c: Context) {
  try {
    // Get raw body for signature verification
    const rawBody = await c.req.text();

    // Verify HMAC signature
    const signature = c.req.header('X-Webhook-Signature');
    if (!verifySignature(rawBody, signature)) {
      console.warn('⚠️ Invalid webhook signature');
      return errorResponse(c, 'Invalid signature', 401, 'INVALID_SIGNATURE');
    }

    // Parse body
    const body = JSON.parse(rawBody);
    const {
      bucket,
      key,
      size,
      contentType,
      etag,
      width,
      height,
      eventTime,
      validationPassed,
      errorMessage,
    } = body;

    // Validate required fields
    if (!bucket || !key) {
      return errorResponse(c, 'Missing required fields: bucket, key', 400);
    }

    console.log('📨 S3 webhook received:', {
      bucket,
      key: key.substring(0, 50) + '...',
      size,
      validationPassed,
    });

    // Find media record by storage path
    const media = await findMediaByStoragePath(bucket, key);

    if (!media) {
      console.warn('⚠️ Media record not found for path:', key);
      // Return success to prevent Lambda retries for orphaned uploads
      return successResponse(c, {
        success: true,
        mediaId: null,
        message: 'Media record not found (may have been deleted)',
      });
    }

    // Determine new status
    const newStatus = validationPassed ? 'ready' : 'failed';

    // Update media record
    const updatedMedia = await updateMediaStatus({
      id: media.id,
      status: newStatus,
      error_message: errorMessage,
      width: width ?? undefined,
      height: height ?? undefined,
      processing_metadata: {
        etag,
        contentType,
        actualSize: size,
        processedAt: eventTime,
        lambdaValidation: validationPassed ? 'passed' : 'failed',
      },
    });

    if (!updatedMedia) {
      console.error('❌ Failed to update media status for:', media.id);
      return errorResponse(c, 'Failed to update media record', 500);
    }

    console.log('✅ Media status updated:', {
      mediaId: media.id,
      status: newStatus,
      dimensions: width && height ? `${width}x${height}` : 'N/A',
    });

    return successResponse(c, {
      success: true,
      mediaId: media.id,
      status: newStatus,
    });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

/**
 * Verify HMAC-SHA256 signature
 */
function verifySignature(payload: string, signature: string | undefined): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.AWS_LAMBDA_MEDIA_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export default handleS3Webhook;
