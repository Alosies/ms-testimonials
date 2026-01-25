/**
 * Media API Composable
 *
 * Provides type-safe methods for media operations using the RPC client.
 */

import { useApi } from '@/shared/api/rpc';
import type { PresignRequest, PresignResponse } from '../models';

/**
 * Media API composable
 * Provides methods for media-related API operations
 */
export function useApiForMedia() {
  const api = useApi();

  /**
   * Request a presigned URL for direct S3 upload
   * POST /media/presign
   *
   * @param request - File metadata for presign request
   * @returns Presigned URL and upload details
   */
  async function requestPresignedUrl(
    request: PresignRequest
  ): Promise<PresignResponse> {
    const res = await api.fetch('/media/presign', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to get presigned URL');
    }

    return res.json() as Promise<PresignResponse>;
  }

  return {
    requestPresignedUrl,
  };
}
