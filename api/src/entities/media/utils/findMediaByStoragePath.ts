import { executeGraphQLAsAdmin } from '@/shared/libs/hasura';
import { FIND_MEDIA_BY_STORAGE_PATH } from '../graphql/operations';
import type { Media } from '../models';

interface FindMediaResponse {
  media: Media[];
}

export async function findMediaByStoragePath(
  storageBucket: string,
  storagePath: string
): Promise<Media | null> {
  const { data, error } = await executeGraphQLAsAdmin<FindMediaResponse>(
    FIND_MEDIA_BY_STORAGE_PATH,
    {
      storage_bucket: storageBucket,
      storage_path: storagePath,
    }
  );

  if (error) {
    console.error('Error finding media by storage path:', error);
    return null;
  }

  return data?.media?.[0] ?? null;
}
