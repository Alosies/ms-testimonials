<script setup lang="ts">
/**
 * ImagePreview Component
 *
 * Displays an image from CDN with optional transformations.
 * Handles loading and error states gracefully.
 *
 * @example
 * ```vue
 * <ImagePreview
 *   :storage-path="media.storagePath"
 *   :width="200"
 *   :height="200"
 *   fit="cover"
 *   alt="Profile picture"
 * />
 * ```
 */

import { ref, computed, watch } from 'vue';
import { Icon } from '@testimonials/icons';
import { useMediaUrl } from '../composables/useMediaUrl';
import type { ImageTransforms } from '../models';

// ============================================================
// PROPS
// ============================================================

const props = withDefaults(
  defineProps<{
    /** Storage path from media record */
    storagePath?: string | null;
    /** Alt text for the image */
    alt?: string;
    /** Transform: target width */
    width?: number;
    /** Transform: target height */
    height?: number;
    /** Transform: fit mode */
    fit?: ImageTransforms['fit'];
    /** Transform: output format */
    format?: ImageTransforms['format'];
    /** Transform: quality (1-100) */
    quality?: number;
    /** Transform: focus point */
    focus?: ImageTransforms['focus'];
    /** Fallback icon name when no image */
    fallbackIcon?: string;
    /** CSS class for the image */
    imgClass?: string;
    /** Whether to show loading skeleton */
    showSkeleton?: boolean;
  }>(),
  {
    alt: 'Image',
    format: 'auto',
    fallbackIcon: 'lucide:image',
    showSkeleton: true,
  }
);

// ============================================================
// TRANSFORMS
// ============================================================

const transforms = computed<ImageTransforms>(() => ({
  width: props.width,
  height: props.height,
  fit: props.fit,
  format: props.format,
  quality: props.quality,
  focus: props.focus,
}));

// ============================================================
// URL GENERATION
// ============================================================

const { url, hasUrl } = useMediaUrl(
  () => props.storagePath,
  transforms.value
);

// Re-compute URL when transforms change
watch(
  transforms,
  () => {
    // The useMediaUrl composable handles this reactively
  },
  { deep: true }
);

// ============================================================
// LOADING STATE
// ============================================================

const isLoading = ref(true);
const hasError = ref(false);

function handleLoad() {
  isLoading.value = false;
  hasError.value = false;
}

function handleError() {
  isLoading.value = false;
  hasError.value = true;
}

// Reset loading state when URL changes
watch(url, () => {
  if (url.value) {
    isLoading.value = true;
    hasError.value = false;
  }
});
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Loading skeleton -->
    <div
      v-if="showSkeleton && isLoading && hasUrl"
      class="absolute inset-0 bg-gray-200 animate-pulse"
    />

    <!-- Actual image -->
    <img
      v-if="hasUrl && !hasError"
      :src="url"
      :alt="alt"
      :class="[
        'transition-opacity duration-300',
        isLoading ? 'opacity-0' : 'opacity-100',
        imgClass,
      ]"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Fallback when no image or error -->
    <div
      v-if="!hasUrl || hasError"
      class="flex items-center justify-center bg-gray-100 text-gray-400 w-full h-full"
    >
      <Icon :icon="fallbackIcon" class="h-8 w-8" />
    </div>
  </div>
</template>
