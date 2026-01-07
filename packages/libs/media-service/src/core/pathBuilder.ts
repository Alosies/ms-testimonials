import { nanoid } from 'nanoid';
import type { EntityType } from '../types';

export interface PathBuilderConfig {
  timezone?: string; // Default: 'Asia/Kolkata'
}

/**
 * Builds S3 storage paths following the pattern:
 * {organization_id}/{entity_type}/{year}/{month}/{day}/{media_id}_{timestamp}.{ext}
 *
 * Example:
 * org_abc123/organization_logo/2025/01/05/med_xyz789_20250105T143022.png
 */
export class PathBuilder {
  private timezone: string;

  constructor(config: PathBuilderConfig = {}) {
    this.timezone = config.timezone ?? 'Asia/Kolkata';
  }

  /**
   * Generate a unique storage path for a new upload
   */
  buildPath(params: {
    organizationId: string;
    entityType: EntityType;
    filename: string;
    mediaId?: string;
  }): { mediaId: string; storagePath: string } {
    const mediaId = params.mediaId ?? `med_${nanoid(12)}`;
    const ext = this.getExtension(params.filename);
    const timestamp = this.formatTimestamp();
    const dateParts = this.getDateParts();

    const storagePath = [
      params.organizationId,
      params.entityType,
      dateParts.year,
      dateParts.month,
      dateParts.day,
      `${mediaId}_${timestamp}.${ext}`,
    ].join('/');

    return { mediaId, storagePath };
  }

  /**
   * Parse a storage path to extract the media ID
   *
   * Path format: {org}/{type}/{year}/{month}/{day}/{mediaId}_{timestamp}.{ext}
   */
  parseMediaId(storagePath: string): string | null {
    const parts = storagePath.split('/');
    if (parts.length < 6) return null;

    const filename = parts[parts.length - 1];
    const match = filename.match(/^(med_[a-zA-Z0-9]+)_/);
    return match ? match[1] : null;
  }

  /**
   * Parse organization ID from storage path
   */
  parseOrganizationId(storagePath: string): string | null {
    const parts = storagePath.split('/');
    return parts.length > 0 ? parts[0] : null;
  }

  /**
   * Parse entity type from storage path
   */
  parseEntityType(storagePath: string): EntityType | null {
    const parts = storagePath.split('/');
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
   * Get file extension from filename
   */
  private getExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) return 'bin';

    const ext = parts[parts.length - 1].toLowerCase();
    // Sanitize extension (only allow alphanumeric)
    return ext.replace(/[^a-z0-9]/g, '') || 'bin';
  }

  /**
   * Format timestamp as YYYYMMDDTHHMMSS
   */
  private formatTimestamp(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '00';

    return `${get('year')}${get('month')}${get('day')}T${get('hour')}${get('minute')}${get('second')}`;
  }

  /**
   * Get date parts for path building
   */
  private getDateParts(): { year: string; month: string; day: string } {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? '00';

    return {
      year: get('year'),
      month: get('month'),
      day: get('day'),
    };
  }
}

/**
 * Default path builder instance
 */
export const pathBuilder = new PathBuilder();
