import { executeGraphQL } from '@/shared/libs/hasura';
import { UPDATE_MEDIA_STATUS } from '../graphql/operations';
import type { Media, UpdateMediaStatusInput } from '../models';

interface UpdateMediaResponse {
  update_media_by_pk: Media | null;
}

export async function updateMediaStatus(
  input: UpdateMediaStatusInput
): Promise<Media | null> {
  const { data, error } = await executeGraphQL<UpdateMediaResponse>(UPDATE_MEDIA_STATUS, {
    id: input.id,
    status: input.status,
    error_message: input.error_message ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    processing_metadata: input.processing_metadata ?? {},
  });

  if (error) {
    console.error('Error updating media status:', error);
    return null;
  }

  return data?.update_media_by_pk ?? null;
}
