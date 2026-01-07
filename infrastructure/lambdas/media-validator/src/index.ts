/**
 * Media Validator Lambda Handler
 *
 * Triggered by S3 ObjectCreated events.
 *
 * Flow:
 * 1. Receive S3 event with object key
 * 2. Validate path format
 * 3. Download and validate file content
 * 4. Extract image dimensions if applicable
 * 5. Call API webhook with results
 * 6. Delete file if validation fails
 *
 * Environment Variables:
 * - API_BASE_URL: Base URL for webhook calls
 * - WEBHOOK_SECRET: HMAC secret for signing webhook requests
 * - STAGE: Current stage (dev, qa, prod)
 */

import type { S3Event, S3Handler } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import {
  validateFile,
  parseEntityTypeFromPath,
  isValidPath,
  formatFileSize,
} from './validator';
import { callWebhook, buildWebhookPayload } from './webhook';

// ============================================================
// CONFIGURATION
// ============================================================

const s3Client = new S3Client({});

const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  webhookSecret: process.env.WEBHOOK_SECRET || 'dev-webhook-secret',
  stage: process.env.STAGE || 'dev',
};

// ============================================================
// HANDLER
// ============================================================

export const handler: S3Handler = async (event: S3Event): Promise<void> => {
  console.log('📥 Received S3 event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const size = record.s3.object.size;
    const etag = record.s3.object.eTag;
    const eventTime = new Date(record.eventTime);

    console.log('🔍 Processing:', { bucket, key, size: formatFileSize(size) });

    try {
      await processUpload({
        bucket,
        key,
        size,
        etag,
        eventTime,
      });
    } catch (error) {
      console.error('❌ Failed to process upload:', error);
      // Don't throw - we don't want Lambda to retry failed validations
      // The file will remain in S3 with status='pending' until cleanup
    }
  }
};

// ============================================================
// PROCESSING
// ============================================================

interface ProcessUploadParams {
  bucket: string;
  key: string;
  size: number;
  etag?: string;
  eventTime: Date;
}

async function processUpload(params: ProcessUploadParams): Promise<void> {
  const { bucket, key, size, etag, eventTime } = params;

  // Skip processing for files in special folders
  if (key.includes('/thumbnails/') || key.startsWith('_')) {
    console.log('⏭️ Skipping special path:', key);
    return;
  }

  // Validate path format
  if (!isValidPath(key)) {
    console.warn('⚠️ Invalid path format, skipping:', key);
    // Don't delete - might be a legitimate file uploaded directly
    return;
  }

  // Parse entity type from path
  const entityType = parseEntityTypeFromPath(key);
  if (!entityType) {
    console.warn('⚠️ Could not determine entity type from path:', key);
    await reportValidationFailure({
      bucket,
      key,
      size,
      etag,
      eventTime,
      contentType: 'unknown',
      errorMessage: 'Could not determine entity type from path',
    });
    return;
  }

  console.log('📋 Entity type:', entityType);

  // Download file
  let buffer: Buffer;
  let contentType: string;

  try {
    const result = await downloadFile(bucket, key);
    buffer = result.buffer;
    contentType = result.contentType;
  } catch (error) {
    console.error('❌ Failed to download file:', error);
    await reportValidationFailure({
      bucket,
      key,
      size,
      etag,
      eventTime,
      contentType: 'unknown',
      errorMessage: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    return;
  }

  // Validate file
  const validationResult = await validateFile(buffer, size, entityType);

  console.log('✅ Validation result:', {
    valid: validationResult.valid,
    detectedMimeType: validationResult.detectedMimeType,
    dimensions: validationResult.dimensions,
    errors: validationResult.errors,
  });

  if (validationResult.valid) {
    // Report success
    await reportValidationSuccess({
      bucket,
      key,
      size,
      etag,
      eventTime,
      contentType: validationResult.detectedMimeType || contentType,
      dimensions: validationResult.dimensions,
    });
  } else {
    // Report failure and optionally delete file
    await reportValidationFailure({
      bucket,
      key,
      size,
      etag,
      eventTime,
      contentType: validationResult.detectedMimeType || contentType,
      errorMessage: validationResult.errors.join('; '),
    });

    // Delete invalid file in non-dev environments
    if (config.stage !== 'dev') {
      await deleteFile(bucket, key);
    } else {
      console.log('🔧 Dev mode: keeping invalid file for debugging');
    }
  }
}

// ============================================================
// S3 OPERATIONS
// ============================================================

async function downloadFile(
  bucket: string,
  key: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('Empty response body');
  }

  const buffer = Buffer.from(await response.Body.transformToByteArray());
  const contentType = response.ContentType || 'application/octet-stream';

  return { buffer, contentType };
}

async function deleteFile(bucket: string, key: string): Promise<void> {
  console.log('🗑️ Deleting invalid file:', { bucket, key });

  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3Client.send(command);

  console.log('✅ File deleted successfully');
}

// ============================================================
// WEBHOOK REPORTING
// ============================================================

interface ReportSuccessParams {
  bucket: string;
  key: string;
  size: number;
  etag?: string;
  eventTime: Date;
  contentType: string;
  dimensions?: { width: number; height: number };
}

async function reportValidationSuccess(params: ReportSuccessParams): Promise<void> {
  const payload = buildWebhookPayload({
    bucket: params.bucket,
    key: params.key,
    size: params.size,
    contentType: params.contentType,
    etag: params.etag,
    eventTime: params.eventTime,
    validationPassed: true,
    dimensions: params.dimensions,
  });

  try {
    await callWebhook(payload, {
      apiBaseUrl: config.apiBaseUrl,
      webhookSecret: config.webhookSecret,
    });
    console.log('✅ Webhook call successful');
  } catch (error) {
    console.error('❌ Webhook call failed:', error);
    // Don't throw - webhook failure shouldn't cause Lambda retry
  }
}

interface ReportFailureParams {
  bucket: string;
  key: string;
  size: number;
  etag?: string;
  eventTime: Date;
  contentType: string;
  errorMessage: string;
}

async function reportValidationFailure(params: ReportFailureParams): Promise<void> {
  const payload = buildWebhookPayload({
    bucket: params.bucket,
    key: params.key,
    size: params.size,
    contentType: params.contentType,
    etag: params.etag,
    eventTime: params.eventTime,
    validationPassed: false,
    errorMessage: params.errorMessage,
  });

  try {
    await callWebhook(payload, {
      apiBaseUrl: config.apiBaseUrl,
      webhookSecret: config.webhookSecret,
    });
    console.log('✅ Failure webhook call successful');
  } catch (error) {
    console.error('❌ Failure webhook call failed:', error);
  }
}
