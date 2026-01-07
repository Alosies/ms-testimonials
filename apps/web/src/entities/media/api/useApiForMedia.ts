/**
 * Media API Composable
 *
 * Provides type-safe methods for media operations.
 * Uses the shared API client for authenticated requests.
 */

import { computed } from 'vue';
import { useTokenManager } from '@/shared/authorization/composables/useTokenManager';
import { createApiClient } from '@/shared/api/lib/apiClient';
import { getApiBaseUrl } from '@/shared/api/config/apiConfig';
import type { PresignRequest, PresignResponse } from '../models';

/**
 * API endpoint paths for media operations
 */
const MEDIA_ENDPOINTS = {
  PRESIGN: '/media/presign',
} as const;

/**
 * Media API composable
 * Provides methods for media-related API operations
 */
export function useApiForMedia() {
  const { getValidEnhancedToken } = useTokenManager();
  const baseUrl = computed(() => getApiBaseUrl());
  const client = createApiClient(baseUrl.value, getValidEnhancedToken);

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
    return client.post<PresignRequest, PresignResponse>(
      MEDIA_ENDPOINTS.PRESIGN,
      request,
      { authenticated: true }
    );
  }

  return {
    requestPresignedUrl,
  };
}
