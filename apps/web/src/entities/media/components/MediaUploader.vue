<script setup lang="ts">
/**
 * MediaUploader Component
 *
 * A drag-and-drop file upload component with progress tracking.
 * Uses useUploadMedia composable for the upload logic.
 *
 * @example
 * ```vue
 * <MediaUploader
 *   entity-type="organization_logo"
 *   @success="handleSuccess"
 *   @error="handleError"
 * />
 * ```
 */

import { ref, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import { useUploadMedia } from '../composables/useUploadMedia';
import {
  ENTITY_VALIDATION_CONFIG,
  type MediaEntityType,
  type UploadResult,
  type UploadError,
} from '../models';

// ============================================================
// PROPS & EMITS
// ============================================================

const props = withDefaults(
  defineProps<{
    /** Entity type for validation and upload */
    entityType: MediaEntityType;
    /** Entity ID to associate with upload */
    entityId?: string;
    /** Custom accept attribute (defaults to entity type's allowed MIME types) */
    accept?: string;
    /** Whether the uploader is disabled */
    disabled?: boolean;
    /** Custom label text */
    label?: string;
    /** Custom hint text */
    hint?: string;
    /** Show file size limit in hint */
    showSizeLimit?: boolean;
  }>(),
  {
    disabled: false,
    showSizeLimit: true,
  }
);

const emit = defineEmits<{
  /** Emitted when upload completes successfully */
  success: [result: UploadResult];
  /** Emitted when upload fails */
  error: [error: UploadError];
}>();

// ============================================================
// UPLOAD COMPOSABLE
// ============================================================

const {
  upload,
  reset,
  status,
  progress,
  error,
  isBusy,
  isUploading,
  isError,
  isCompleted,
} = useUploadMedia({
  entityType: props.entityType,
  entityId: props.entityId,
  onSuccess: (result) => emit('success', result),
  onError: (err) => emit('error', err),
});

// ============================================================
// LOCAL STATE
// ============================================================

const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// ============================================================
// COMPUTED
// ============================================================

const config = computed(() => ENTITY_VALIDATION_CONFIG[props.entityType]);

const acceptTypes = computed(() => {
  if (props.accept) return props.accept;
  return config.value.allowedMimeTypes.join(',');
});

const maxSizeMB = computed(() =>
  Math.round(config.value.maxFileSizeBytes / (1024 * 1024))
);

const labelText = computed(() => {
  if (props.label) return props.label;
  return `Upload ${config.value.displayName}`;
});

const hintText = computed(() => {
  if (props.hint) return props.hint;
  const types = config.value.allowedMimeTypes
    .map((t) => t.split('/')[1].toUpperCase())
    .join(', ');
  return props.showSizeLimit
    ? `${types} up to ${maxSizeMB.value}MB`
    : types;
});

const statusText = computed(() => {
  switch (status.value) {
    case 'validating':
      return 'Validating file...';
    case 'requesting_url':
      return 'Preparing upload...';
    case 'uploading':
      return `Uploading... ${progress.value.percentage}%`;
    case 'processing':
      return 'Processing...';
    case 'completed':
      return 'Upload complete!';
    case 'error':
      return error.value?.message || 'Upload failed';
    default:
      return '';
  }
});

const isDisabled = computed(() => props.disabled || isBusy.value);

// ============================================================
// METHODS
// ============================================================

function openFilePicker() {
  if (isDisabled.value) return;
  fileInputRef.value?.click();
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    await upload(file);
  }
  // Reset input so same file can be selected again
  input.value = '';
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (!isDisabled.value) {
    isDragOver.value = true;
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;

  if (isDisabled.value) return;

  const file = event.dataTransfer?.files[0];
  if (file) {
    await upload(file);
  }
}

function handleRetry() {
  reset();
}
</script>

<template>
  <div class="w-full">
    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="acceptTypes"
      :disabled="isDisabled"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Drop zone -->
    <div
      role="button"
      tabindex="0"
      :class="[
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        {
          'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 cursor-pointer':
            !isDisabled && !isDragOver && !isError && !isCompleted,
          'border-primary-400 bg-primary-50': isDragOver,
          'border-red-300 bg-red-50': isError,
          'border-green-300 bg-green-50': isCompleted,
          'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60': isDisabled,
        },
      ]"
      @click="openFilePicker"
      @keydown.enter="openFilePicker"
      @keydown.space.prevent="openFilePicker"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Idle state -->
      <template v-if="status === 'idle'">
        <Icon
          icon="lucide:upload-cloud"
          class="h-10 w-10 text-gray-400 mb-3"
        />
        <p class="text-sm font-medium text-gray-700">
          {{ labelText }}
        </p>
        <p class="mt-1 text-xs text-gray-500">
          Drag and drop or click to browse
        </p>
        <p class="mt-1 text-xs text-gray-400">
          {{ hintText }}
        </p>
      </template>

      <!-- Uploading state -->
      <template v-else-if="isUploading || status === 'validating' || status === 'requesting_url'">
        <div class="flex flex-col items-center">
          <Icon
            icon="lucide:loader-2"
            class="h-10 w-10 text-primary-500 mb-3 animate-spin"
          />
          <p class="text-sm font-medium text-gray-700">
            {{ statusText }}
          </p>
          <!-- Progress bar -->
          <div
            v-if="isUploading"
            class="mt-3 w-48 h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              class="h-full bg-primary-500 transition-all duration-300"
              :style="{ width: `${progress.percentage}%` }"
            />
          </div>
        </div>
      </template>

      <!-- Completed state -->
      <template v-else-if="isCompleted">
        <Icon
          icon="lucide:check-circle"
          class="h-10 w-10 text-green-500 mb-3"
        />
        <p class="text-sm font-medium text-green-700">
          {{ statusText }}
        </p>
        <Button
          variant="ghost"
          size="sm"
          class="mt-2"
          @click.stop="handleRetry"
        >
          Upload another
        </Button>
      </template>

      <!-- Error state -->
      <template v-else-if="isError">
        <Icon
          icon="lucide:alert-circle"
          class="h-10 w-10 text-red-500 mb-3"
        />
        <p class="text-sm font-medium text-red-700 text-center max-w-xs">
          {{ statusText }}
        </p>
        <Button
          variant="ghost"
          size="sm"
          class="mt-2"
          @click.stop="handleRetry"
        >
          Try again
        </Button>
      </template>
    </div>
  </div>
</template>
