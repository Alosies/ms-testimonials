/**
 * useUploadMedia Composable
 *
 * Handles the complete media upload flow:
 * 1. Client-side file validation
 * 2. Request presigned URL from API
 * 3. Upload directly to S3
 * 4. Track upload progress
 * 5. Handle success/error callbacks
 *
 * The Lambda validates the file after upload and updates the media status.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useUploadMedia } from '@/entities/media';
 *
 * const {
 *   upload,
 *   progress,
 *   status,
 *   error,
 *   reset
 * } = useUploadMedia({
 *   entityType: 'organization_logo',
 *   onSuccess: (result) => {
 *     console.log('Upload complete:', result.mediaId);
 *   },
 *   onError: (error) => {
 *     console.error('Upload failed:', error.message);
 *   }
 * });
 *
 * async function handleFileSelect(file: File) {
 *   await upload(file);
 * }
 * </script>
 * ```
 */

import { ref, computed, readonly } from 'vue';
import { useApiForMedia } from '../api/useApiForMedia';
import {
  ENTITY_VALIDATION_CONFIG,
  type MediaEntityType,
  type UploadProgress,
  type UploadStatus,
  type UploadResult,
  type UploadError,
  type UseUploadMediaOptions,
} from '../models';

// ============================================================
// VALIDATION
// ============================================================

/**
 * Validate file against entity type constraints
 *
 * @param file - File to validate
 * @param entityType - Entity type for validation rules
 * @returns Validation result with error if invalid
 */
function validateFile(
  file: File,
  entityType: MediaEntityType
): { valid: true } | { valid: false; error: UploadError } {
  const config = ENTITY_VALIDATION_CONFIG[entityType];

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `File type "${file.type}" is not allowed for ${config.displayName}. Allowed: ${config.allowedMimeTypes.join(', ')}`,
        details: { allowedTypes: config.allowedMimeTypes, actualType: file.type },
      },
    };
  }

  // Check file size
  if (file.size > config.maxFileSizeBytes) {
    const maxMB = Math.round(config.maxFileSizeBytes / (1024 * 1024));
    const actualMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `File size (${actualMB}MB) exceeds maximum allowed (${maxMB}MB) for ${config.displayName}`,
        details: {
          maxBytes: config.maxFileSizeBytes,
          actualBytes: file.size,
        },
      },
    };
  }

  return { valid: true };
}

// ============================================================
// S3 UPLOAD
// ============================================================

/**
 * Upload file directly to S3 using presigned URL
 *
 * @param file - File to upload
 * @param uploadUrl - Presigned S3 URL
 * @param headers - Required headers for the upload
 * @param onProgress - Progress callback
 * @returns Promise that resolves on successful upload
 */
async function uploadToS3(
  file: File,
  uploadUrl: string,
  headers: Record<string, string>,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during S3 upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('S3 upload was aborted'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('S3 upload timed out'));
    });

    // Configure request
    xhr.open('PUT', uploadUrl);

    // Set headers from presign response
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Send the file
    xhr.send(file);
  });
}

// ============================================================
// COMPOSABLE
// ============================================================

/**
 * useUploadMedia composable
 *
 * Provides reactive state and methods for file uploads.
 *
 * @param options - Upload configuration options
 * @returns Reactive upload state and methods
 */
export function useUploadMedia(options: UseUploadMediaOptions) {
  const { entityType, entityId, onSuccess, onError, onProgress } = options;

  // ============================================================
  // STATE
  // ============================================================

  const status = ref<UploadStatus>('idle');
  const progress = ref<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const error = ref<UploadError | null>(null);
  const result = ref<UploadResult | null>(null);

  // Abort controller for cancellation
  let abortController: AbortController | null = null;

  // ============================================================
  // COMPUTED
  // ============================================================

  const isIdle = computed(() => status.value === 'idle');
  const isValidating = computed(() => status.value === 'validating');
  const isRequestingUrl = computed(() => status.value === 'requesting_url');
  const isUploading = computed(() => status.value === 'uploading');
  const isProcessing = computed(() => status.value === 'processing');
  const isCompleted = computed(() => status.value === 'completed');
  const isError = computed(() => status.value === 'error');
  const isBusy = computed(
    () =>
      status.value === 'validating' ||
      status.value === 'requesting_url' ||
      status.value === 'uploading' ||
      status.value === 'processing'
  );
  const hasError = computed(() => error.value !== null);

  // ============================================================
  // METHODS
  // ============================================================

  /**
   * Reset state to initial values
   */
  function reset() {
    status.value = 'idle';
    progress.value = { loaded: 0, total: 0, percentage: 0 };
    error.value = null;
    result.value = null;
    abortController = null;
  }

  /**
   * Set error state and trigger callback
   */
  function setError(uploadError: UploadError) {
    error.value = uploadError;
    status.value = 'error';
    onError?.(uploadError);
  }

  /**
   * Update progress and trigger callback
   */
  function updateProgress(uploadProgress: UploadProgress) {
    progress.value = uploadProgress;
    onProgress?.(uploadProgress);
  }

  /**
   * Upload a file
   *
   * @param file - File to upload
   * @returns Promise with upload result or null on error
   */
  async function upload(file: File): Promise<UploadResult | null> {
    // Reset state for new upload
    reset();
    abortController = new AbortController();

    try {
      // ========================================
      // Step 1: Validate file
      // ========================================
      status.value = 'validating';

      const validation = validateFile(file, entityType);
      if (!validation.valid) {
        setError(validation.error);
        return null;
      }

      // ========================================
      // Step 2: Request presigned URL
      // ========================================
      status.value = 'requesting_url';

      const { requestPresignedUrl } = useApiForMedia();

      let presignResponse;
      try {
        presignResponse = await requestPresignedUrl({
          filename: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
          entityType,
          entityId,
        });
      } catch (err) {
        setError({
          code: 'PRESIGN_ERROR',
          message:
            err instanceof Error
              ? err.message
              : 'Failed to get upload URL',
          details: err,
        });
        return null;
      }

      // ========================================
      // Step 3: Upload to S3
      // ========================================
      status.value = 'uploading';

      try {
        await uploadToS3(
          file,
          presignResponse.uploadUrl,
          presignResponse.headers,
          updateProgress
        );
      } catch (err) {
        setError({
          code: 'UPLOAD_ERROR',
          message:
            err instanceof Error
              ? err.message
              : 'Failed to upload file',
          details: err,
        });
        return null;
      }

      // ========================================
      // Step 4: Complete
      // ========================================
      // Note: Lambda validates asynchronously and updates media status
      // The upload is complete from the client's perspective
      status.value = 'completed';

      const uploadResult: UploadResult = {
        mediaId: presignResponse.mediaId,
        storagePath: presignResponse.storagePath,
        filename: file.name,
      };

      result.value = uploadResult;
      onSuccess?.(uploadResult);

      return uploadResult;
    } catch (err) {
      // Catch any unexpected errors
      const uploadError: UploadError = {
        code: 'UNKNOWN',
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred',
        details: err,
      };
      setError(uploadError);
      return null;
    }
  }

  /**
   * Cancel an in-progress upload
   */
  function cancel() {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    reset();
  }

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Methods
    upload,
    reset,
    cancel,

    // State (readonly to prevent external mutation)
    status: readonly(status),
    progress: readonly(progress),
    error: readonly(error),
    result: readonly(result),

    // Computed status flags
    isIdle,
    isValidating,
    isRequestingUrl,
    isUploading,
    isProcessing,
    isCompleted,
    isError,
    isBusy,
    hasError,
  };
}
