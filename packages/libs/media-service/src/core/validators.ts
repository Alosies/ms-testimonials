import { fileTypeFromBuffer } from 'file-type';
import type { EntityType, ValidationConfig } from '../types';
import { ENTITY_VALIDATION_CONFIG } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate file metadata before generating presigned URL
 * This is the first line of defense - fast rejection before upload
 */
export function validateUploadRequest(params: {
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  entityType: EntityType;
}): ValidationResult {
  const errors: string[] = [];
  const config = ENTITY_VALIDATION_CONFIG[params.entityType];

  if (!config) {
    errors.push(`Unknown entity type: ${params.entityType}`);
    return { valid: false, errors };
  }

  // Check file size
  if (params.fileSizeBytes > config.maxFileSizeBytes) {
    const maxMB = Math.round(config.maxFileSizeBytes / (1024 * 1024));
    const actualMB = (params.fileSizeBytes / (1024 * 1024)).toFixed(2);
    errors.push(`File size ${actualMB}MB exceeds maximum ${maxMB}MB`);
  }

  if (params.fileSizeBytes <= 0) {
    errors.push('File size must be greater than 0');
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(params.mimeType)) {
    errors.push(
      `MIME type "${params.mimeType}" not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`
    );
  }

  // Basic filename validation
  if (!params.filename || params.filename.trim().length === 0) {
    errors.push('Filename is required');
  }

  // Check for suspicious filename patterns
  if (params.filename && /[<>:"|?*\x00-\x1f]/.test(params.filename)) {
    errors.push('Filename contains invalid characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file content after upload (called by Lambda)
 * This is the second line of defense - content-based verification
 */
export async function validateFileContent(params: {
  buffer: Buffer;
  expectedMimeType: string;
  entityType: EntityType;
}): Promise<ValidationResult> {
  const errors: string[] = [];
  const config = ENTITY_VALIDATION_CONFIG[params.entityType];

  if (!config) {
    errors.push(`Unknown entity type: ${params.entityType}`);
    return { valid: false, errors };
  }

  // Check file size from actual buffer
  if (params.buffer.length > config.maxFileSizeBytes) {
    const maxMB = Math.round(config.maxFileSizeBytes / (1024 * 1024));
    const actualMB = (params.buffer.length / (1024 * 1024)).toFixed(2);
    errors.push(`File size ${actualMB}MB exceeds maximum ${maxMB}MB`);
  }

  // Detect actual MIME type from file content
  const detected = await fileTypeFromBuffer(params.buffer);

  if (!detected) {
    // Some files (like SVG, plain text) may not be detected
    // For SVG, check if it starts with expected content
    if (params.expectedMimeType === 'image/svg+xml') {
      const content = params.buffer.toString('utf-8', 0, 500).toLowerCase();
      if (!content.includes('<svg') && !content.includes('<?xml')) {
        errors.push('Invalid SVG file: missing SVG root element');
      }
    } else {
      errors.push('Unable to detect file type from content');
    }
  } else {
    // Verify detected MIME type matches expected
    if (detected.mime !== params.expectedMimeType) {
      // Allow some flexibility for equivalent types
      if (!areMimeTypesEquivalent(detected.mime, params.expectedMimeType)) {
        errors.push(
          `Detected MIME type "${detected.mime}" does not match declared "${params.expectedMimeType}"`
        );
      }
    }

    // Verify detected type is allowed for this entity
    if (!config.allowedMimeTypes.includes(detected.mime)) {
      errors.push(
        `Detected MIME type "${detected.mime}" not allowed for ${params.entityType}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get validation config for an entity type
 */
export function getValidationConfig(
  entityType: EntityType
): ValidationConfig | null {
  return ENTITY_VALIDATION_CONFIG[entityType] ?? null;
}

/**
 * Check if entity type is valid
 */
export function isValidEntityType(type: string): type is EntityType {
  return type in ENTITY_VALIDATION_CONFIG;
}

/**
 * Get all valid entity types
 */
export function getValidEntityTypes(): EntityType[] {
  return Object.keys(ENTITY_VALIDATION_CONFIG) as EntityType[];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if two MIME types are equivalent
 * (handles cases like image/jpg vs image/jpeg)
 */
function areMimeTypesEquivalent(type1: string, type2: string): boolean {
  const normalize = (type: string) =>
    type.toLowerCase().replace('image/jpg', 'image/jpeg');
  return normalize(type1) === normalize(type2);
}
