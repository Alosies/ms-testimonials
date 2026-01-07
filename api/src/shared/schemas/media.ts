/**
 * Media Upload Zod Schemas
 */

import { z } from '@hono/zod-openapi';

/**
 * Valid entity types for media uploads
 */
export const EntityTypeSchema = z.enum([
  'organization_logo',
  'contact_avatar',
  'testimonial_video',
  'form_attachment',
]).openapi({
  description: 'Type of entity this media is associated with',
  example: 'organization_logo',
});

/**
 * Media status values
 */
export const MediaStatusSchema = z.enum([
  'pending',
  'processing',
  'ready',
  'failed',
  'deleted',
]).openapi({
  description: 'Processing status of the media file',
  example: 'ready',
});

/**
 * Presign request body
 */
export const PresignRequestSchema = z.object({
  filename: z.string().min(1).max(255).openapi({
    description: 'Original filename of the file to upload',
    example: 'company-logo.png',
  }),
  mimeType: z.string().min(1).openapi({
    description: 'MIME type of the file',
    example: 'image/png',
  }),
  fileSizeBytes: z.number().int().positive().openapi({
    description: 'Size of the file in bytes',
    example: 245678,
  }),
  entityType: EntityTypeSchema,
  entityId: z.string().optional().openapi({
    description: 'ID of the entity this media will be associated with (optional for pending uploads)',
    example: 'org_abc123',
  }),
}).openapi('PresignRequest');

/**
 * Presign response
 */
export const PresignResponseSchema = z.object({
  mediaId: z.string().openapi({
    description: 'Unique ID of the media record',
    example: 'med_xyz789abc',
  }),
  uploadUrl: z.string().url().openapi({
    description: 'Presigned URL for direct upload to S3',
    example: 'https://testimonials-dev-uploads.s3.ap-south-1.amazonaws.com/...',
  }),
  storagePath: z.string().openapi({
    description: 'Full storage path where the file will be stored',
    example: 'org_abc123/organization_logo/2025/01/05/med_xyz789_20250105T143022.png',
  }),
  expiresAt: z.string().datetime().openapi({
    description: 'When the presigned URL expires',
    example: '2025-01-05T15:30:22Z',
  }),
  headers: z.record(z.string()).openapi({
    description: 'Headers that must be included in the upload request',
    example: { 'Content-Type': 'image/png', 'Content-Length': '245678' },
  }),
}).openapi('PresignResponse');

/**
 * S3 webhook request body (from Lambda)
 */
export const S3WebhookRequestSchema = z.object({
  bucket: z.string().openapi({
    description: 'S3 bucket name',
    example: 'testimonials-dev-uploads',
  }),
  key: z.string().openapi({
    description: 'S3 object key (storage path)',
    example: 'org_abc123/organization_logo/2025/01/05/med_xyz789_20250105T143022.png',
  }),
  size: z.number().int().positive().openapi({
    description: 'Actual file size in bytes',
    example: 245678,
  }),
  contentType: z.string().openapi({
    description: 'Detected content type',
    example: 'image/png',
  }),
  etag: z.string().optional().openapi({
    description: 'S3 ETag of the uploaded object',
    example: '"abc123def456..."',
  }),
  width: z.number().int().positive().optional().openapi({
    description: 'Image width in pixels (if applicable)',
    example: 512,
  }),
  height: z.number().int().positive().optional().openapi({
    description: 'Image height in pixels (if applicable)',
    example: 512,
  }),
  eventTime: z.string().datetime().openapi({
    description: 'When the S3 event occurred',
    example: '2025-01-05T14:30:22Z',
  }),
  validationPassed: z.boolean().openapi({
    description: 'Whether Lambda validation passed',
    example: true,
  }),
  errorMessage: z.string().optional().openapi({
    description: 'Error message if validation failed',
    example: 'File size exceeds maximum limit',
  }),
}).openapi('S3WebhookRequest');

/**
 * S3 webhook response
 */
export const S3WebhookResponseSchema = z.object({
  success: z.boolean().openapi({
    description: 'Whether the webhook was processed successfully',
    example: true,
  }),
  mediaId: z.string().optional().openapi({
    description: 'ID of the updated media record',
    example: 'med_xyz789abc',
  }),
  status: MediaStatusSchema.optional().openapi({
    description: 'New status of the media record',
  }),
}).openapi('S3WebhookResponse');

/**
 * Media record response
 */
export const MediaRecordSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  fileSizeBytes: z.number(),
  storagePath: z.string(),
  entityType: EntityTypeSchema,
  entityId: z.string().nullable(),
  status: MediaStatusSchema,
  width: z.number().nullable(),
  height: z.number().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('MediaRecord');

// Type exports
export type EntityType = z.infer<typeof EntityTypeSchema>;
export type MediaStatus = z.infer<typeof MediaStatusSchema>;
export type PresignRequest = z.infer<typeof PresignRequestSchema>;
export type PresignResponse = z.infer<typeof PresignResponseSchema>;
export type S3WebhookRequest = z.infer<typeof S3WebhookRequestSchema>;
export type S3WebhookResponse = z.infer<typeof S3WebhookResponseSchema>;
