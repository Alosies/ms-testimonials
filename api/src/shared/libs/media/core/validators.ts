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
