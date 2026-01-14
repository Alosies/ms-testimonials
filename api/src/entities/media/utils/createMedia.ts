import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { INSERT_MEDIA } from '../graphql/operations';
import type { Media, CreateMediaInput } from '../models';

interface InsertMediaResponse {
  insert_media_one: Media | null;
}

export async function createMedia(input: CreateMediaInput): Promise<Media | null> {
  const { data, error } = await executeGraphQLAsAdmin<InsertMediaResponse>(INSERT_MEDIA, {
    organization_id: input.organization_id,
    filename: input.filename,
    mime_type: input.mime_type,
    file_size_bytes: input.file_size_bytes,
    storage_provider: input.storage_provider ?? 'aws_s3',
    storage_bucket: input.storage_bucket,
    storage_path: input.storage_path,
    storage_region: input.storage_region ?? null,
    entity_type: input.entity_type,
    entity_id: input.entity_id ?? null,
    status: input.status ?? 'pending',
    uploaded_by: input.uploaded_by ?? null,
  });

  if (error) {
    console.error('Error creating media record:', error);
    return null;
  }

  return data?.insert_media_one ?? null;
}
