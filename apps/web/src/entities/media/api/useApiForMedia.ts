/**
 * Media API Composable
 *
 * Provides type-safe methods for media operations.
 * Types imported from API schemas for end-to-end type safety (per ADR-021).
 */

import { useApi } from '@/shared/api/rest';
import type { PresignRequest, PresignResponse } from '@api/shared/schemas/media';

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
    return api.post<PresignRequest, PresignResponse>('/media/presign', request);
  }

  return {
    requestPresignedUrl,
  };
}
