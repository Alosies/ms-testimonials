/**
 * Media entity types
 */

export type MediaStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'deleted';

export type EntityType =
  | 'organization_logo'
  | 'contact_avatar'
  | 'testimonial_video'
  | 'form_attachment';

export interface Media {
  id: string;
  organization_id: string;
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_provider: string;
  storage_bucket: string;
  storage_path: string;
  storage_region: string | null;
  entity_type: EntityType;
  entity_id: string | null;
  status: MediaStatus;
  error_message: string | null;
  processing_metadata: Record<string, unknown>;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  thumbnail_path: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMediaInput {
  organization_id: string;
  filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_provider?: string;
  storage_bucket: string;
  storage_path: string;
  storage_region?: string;
  entity_type: EntityType;
  entity_id?: string;
  status?: MediaStatus;
  uploaded_by?: string;
}

export interface UpdateMediaStatusInput {
  id: string;
  status: MediaStatus;
  error_message?: string;
  width?: number;
  height?: number;
  processing_metadata?: Record<string, unknown>;
}
