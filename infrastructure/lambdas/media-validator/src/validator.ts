/**
 * File Validator
 *
 * Validates uploaded files by checking:
 * - MIME type from file content (not headers)
 * - File size against entity type limits
 * - Extracts image dimensions using sharp
 *
 * IMPORTANT: Keep validation rules in sync with:
 * - db/hasura/migrations/.../media_entity_types/up.sql (seed data)
 * - packages/libs/media-service/src/types/index.ts (ENTITY_VALIDATION_CONFIG)
 */

import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

// ============================================================
// ENTITY TYPE CONFIGURATION
// Must match database seed data and media-service types
// ============================================================

export type EntityType =
  | 'organization_logo'
  | 'contact_avatar'
  | 'testimonial_video'
  | 'form_attachment';

interface ValidationConfig {
  allowedMimeTypes: string[];
  maxFileSizeBytes: number;
}

/**
 * Validation configuration for each entity type
 * Keep in sync with database and media-service package
 */
export const ENTITY_VALIDATION_CONFIG: Record<EntityType, ValidationConfig> = {
  organization_logo: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
  },
  contact_avatar: {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeBytes: 2 * 1024 * 1024, // 2MB
  },
  testimonial_video: {
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
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
  },
};

// ============================================================
// VALIDATION TYPES
// ============================================================

export interface ValidationResult {
  valid: boolean;
  detectedMimeType: string | null;
  errors: string[];
  dimensions?: {
    width: number;
    height: number;
  };
}

// ============================================================
// PATH PARSING
// ============================================================

/**
 * Parse entity type from S3 storage path
 * Path format: {org_id}/{entity_type}/{year}/{month}/{day}/{media_id}_{timestamp}.{ext}
 */
export function parseEntityTypeFromPath(key: string): EntityType | null {
  const parts = key.split('/');
  if (parts.length < 2) return null;

  const entityType = parts[1];
  const validTypes: EntityType[] = [
    'organization_logo',
    'contact_avatar',
    'testimonial_video',
    'form_attachment',
  ];

  return validTypes.includes(entityType as EntityType)
    ? (entityType as EntityType)
    : null;
}

/**
 * Validate S3 path matches expected pattern
 */
export function isValidPath(key: string): boolean {
  // Pattern: {org_id}/{entity_type}/{year}/{month}/{day}/{media_id}_{timestamp}.{ext}
  const pattern =
    /^[a-zA-Z0-9_-]+\/(organization_logo|contact_avatar|testimonial_video|form_attachment)\/\d{4}\/\d{2}\/\d{2}\/med_[a-zA-Z0-9]+_\d{8}T\d{6}\.[a-zA-Z0-9]+$/;
  return pattern.test(key);
}

// ============================================================
// VALIDATION FUNCTIONS
// ============================================================

/**
 * Validate file content
 *
 * @param buffer - File content buffer
 * @param fileSize - File size in bytes
 * @param entityType - Entity type from path
 */
export async function validateFile(
  buffer: Buffer,
  fileSize: number,
  entityType: EntityType
): Promise<ValidationResult> {
  const errors: string[] = [];
  const config = ENTITY_VALIDATION_CONFIG[entityType];

  if (!config) {
    return {
      valid: false,
      detectedMimeType: null,
      errors: [`Unknown entity type: ${entityType}`],
    };
  }

  // Check file size
  if (fileSize > config.maxFileSizeBytes) {
    const maxMB = Math.round(config.maxFileSizeBytes / (1024 * 1024));
    const actualMB = (fileSize / (1024 * 1024)).toFixed(2);
    errors.push(`File size ${actualMB}MB exceeds maximum ${maxMB}MB for ${entityType}`);
  }

  // Detect MIME type from file content
  const detected = await fileTypeFromBuffer(buffer);
  let detectedMimeType: string | null = null;

  if (!detected) {
    // Check for SVG (text-based, not detected by file-type)
    if (isSvgContent(buffer)) {
      detectedMimeType = 'image/svg+xml';
    } else {
      errors.push('Unable to detect file type from content');
    }
  } else {
    detectedMimeType = detected.mime;
  }

  // Verify detected type is allowed for this entity
  if (detectedMimeType && !config.allowedMimeTypes.includes(detectedMimeType)) {
    errors.push(
      `MIME type "${detectedMimeType}" not allowed for ${entityType}. ` +
        `Allowed: ${config.allowedMimeTypes.join(', ')}`
    );
  }

  // Extract dimensions for images
  let dimensions: { width: number; height: number } | undefined;

  if (detectedMimeType && isImageMimeType(detectedMimeType)) {
    try {
      dimensions = await extractImageDimensions(buffer);
    } catch (err) {
      console.warn('Failed to extract image dimensions:', err);
      // Don't fail validation for dimension extraction errors
    }
  }

  return {
    valid: errors.length === 0,
    detectedMimeType,
    errors,
    dimensions,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Check if buffer contains SVG content
 */
function isSvgContent(buffer: Buffer): boolean {
  const content = buffer.toString('utf-8', 0, 500).toLowerCase().trim();
  return content.startsWith('<?xml') || content.startsWith('<svg');
}

/**
 * Check if MIME type is an image type
 */
function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/') && mimeType !== 'image/svg+xml';
}

/**
 * Extract image dimensions using sharp
 */
async function extractImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Could not determine image dimensions');
  }

  return {
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
