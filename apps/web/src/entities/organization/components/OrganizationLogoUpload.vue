<script setup lang="ts">
/**
 * OrganizationLogoUpload Component
 *
 * Modern logo upload with preview, inline upload zone, and status indicators.
 * Uses useUploadMedia composable for S3 uploads via presigned URLs.
 */
import { ref, computed } from 'vue';
import { Label } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { ImagePreview, useUploadMedia } from '@/entities/media';

const props = defineProps<{
  organizationId: string;
}>();

const modelValue = defineModel<string>({ required: true });

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null);

// Initialize upload composable
const {
  upload,
  status: rawUploadStatus,
  error: rawUploadError,
  reset: resetUpload,
} = useUploadMedia({
  entityType: 'organization_logo',
  entityId: props.organizationId,
  onSuccess: (result) => {
    modelValue.value = result.storagePath;
  },
});

/**
 * Check if a value is a storage path (vs legacy full URL)
 * Storage paths follow the pattern: {org_id}/{entity_type}/YYYY/MM/DD/med_xxx_timestamp.ext
 */
function isStoragePath(value: string): boolean {
  if (!value) return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  return value.includes('/') && (value.includes('/med_') || value.includes('organization_logo'));
}

// Computed upload status for template
const uploadStatus = computed(() => rawUploadStatus.value);
const uploadStatusText = computed(() => {
  switch (rawUploadStatus.value) {
    case 'validating': return 'Validating...';
    case 'requesting_url': return 'Preparing upload...';
    case 'uploading': return 'Uploading...';
    case 'processing': return 'Processing...';
    default: return '';
  }
});
const uploadError = computed(() => rawUploadError.value?.message ?? '');

// Trigger file input click
function triggerFileUpload() {
  fileInputRef.value?.click();
}

// Handle file selection
async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    await upload(file);
  }
  // Reset input so same file can be selected again
  input.value = '';
}

// Remove current logo
function handleRemoveLogo() {
  modelValue.value = '';
  resetUpload();
}

// Validation - storage paths and valid URLs are both acceptable
const error = computed(() => {
  if (!modelValue.value.trim()) return null;
  if (isStoragePath(modelValue.value)) return null;
  try {
    new URL(modelValue.value);
    return null;
  } catch {
    return 'Please enter a valid URL or upload an image';
  }
});

// Expose error state for parent validation
defineExpose({ error });
</script>

<template>
  <div class="space-y-3">
    <Label>Organization Logo</Label>

    <!-- Current Logo Preview with integrated upload -->
    <div class="flex items-start gap-6">
      <!-- Preview Image -->
      <div class="relative group shrink-0">
        <div
          class="w-24 h-24 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden shadow-sm"
        >
          <template v-if="modelValue">
            <!-- Storage path - use ImageKit CDN -->
            <ImagePreview
              v-if="isStoragePath(modelValue)"
              :storage-path="modelValue"
              :width="96"
              :height="96"
              fit="contain"
              alt="Organization logo"
              class="w-full h-full"
              img-class="w-full h-full object-contain p-2"
            />
            <!-- Legacy URL - direct img tag -->
            <img
              v-else
              :src="modelValue"
              alt="Organization logo"
              class="w-full h-full object-contain p-2"
            />
          </template>
          <!-- Placeholder when no logo -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
          >
            <Icon icon="lucide:building-2" class="w-10 h-10 text-gray-300" />
          </div>
        </div>

        <!-- Remove button overlay (only when logo exists) -->
        <button
          v-if="modelValue"
          type="button"
          class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remove logo"
          @click="handleRemoveLogo"
        >
          <Icon icon="lucide:x" class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Upload area - compact inline -->
      <div class="flex-1 min-w-0">
        <div
          role="button"
          tabindex="0"
          class="relative flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-gray-300 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          @click="triggerFileUpload"
          @keydown.enter="triggerFileUpload"
          @keydown.space.prevent="triggerFileUpload"
        >
          <div class="shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <Icon icon="lucide:upload" class="w-5 h-5 text-primary-600" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-700 truncate">
              {{ modelValue ? 'Change logo' : 'Upload logo' }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              PNG, JPG, GIF, WebP up to 5MB
            </p>
          </div>
        </div>

        <!-- Upload progress/status (inline) -->
        <div v-if="uploadStatus !== 'idle'" class="mt-2">
          <!-- Uploading -->
          <div v-if="uploadStatus === 'uploading' || uploadStatus === 'validating' || uploadStatus === 'requesting_url'" class="flex items-center gap-2">
            <Icon icon="lucide:loader-2" class="w-4 h-4 text-primary-500 animate-spin" />
            <span class="text-xs text-gray-600">{{ uploadStatusText }}</span>
          </div>
          <!-- Success -->
          <div v-else-if="uploadStatus === 'completed'" class="flex items-center gap-2">
            <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-500" />
            <span class="text-xs text-green-600">Upload complete</span>
          </div>
          <!-- Error -->
          <div v-else-if="uploadStatus === 'error'" class="flex items-center gap-2">
            <Icon icon="lucide:alert-circle" class="w-4 h-4 text-red-500" />
            <span class="text-xs text-red-600">{{ uploadError }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp"
      class="hidden"
      @change="handleFileSelect"
    />

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else class="text-xs text-gray-500">
      Optional. Your logo will be displayed on forms and widgets.
    </p>
  </div>
</template>
