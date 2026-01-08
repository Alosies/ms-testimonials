<script setup lang="ts">
/**
 * OrganizationLogo Component
 *
 * Centralized component for displaying organization logos.
 * Handles storage paths (via ImageKit CDN).
 *
 * @example
 * ```vue
 * <OrganizationLogo :logo-url="organization.logo?.storage_path" size="md" />
 * <OrganizationLogo :logo-url="effectiveLogo" size="sm" rounded />
 * ```
 */
import { ref, computed, watch } from 'vue';
import { Icon } from '@testimonials/icons';
import { ImagePreview } from '@/entities/media';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    /** Logo URL - can be storage path or full URL */
    logoUrl: string | null | undefined;
    /** Size preset */
    size?: LogoSize;
    /** Use rounded corners */
    rounded?: boolean;
    /** Show placeholder when no logo */
    showPlaceholder?: boolean;
    /** Alt text for the image */
    alt?: string;
  }>(),
  {
    size: 'md',
    rounded: false,
    showPlaceholder: true,
    alt: 'Organization logo',
  }
);

// Size mappings
const sizeConfig: Record<LogoSize, { container: string; icon: string; width: number; height: number }> = {
  xs: { container: 'w-6 h-6', icon: 'w-3 h-3', width: 24, height: 24 },
  sm: { container: 'w-8 h-8', icon: 'w-4 h-4', width: 32, height: 32 },
  md: { container: 'w-12 h-12', icon: 'w-6 h-6', width: 48, height: 48 },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8', width: 64, height: 64 },
};

const config = computed(() => sizeConfig[props.size]);

/**
 * Check if value is a storage path (vs legacy full URL)
 * Storage paths follow pattern: {org_id}/{entity_type}/YYYY/MM/DD/med_xxx_timestamp.ext
 */
function isStoragePath(value: string): boolean {
  if (!value) return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  return value.includes('/') && (value.includes('/med_') || value.includes('organization_logo'));
}

// Loading/error states
const hasError = ref(false);

function handleError() {
  hasError.value = true;
}

function handleLoad() {
  hasError.value = false;
}

// Normalized logo URL for template usage
const logoUrlNormalized = computed(() => props.logoUrl ?? '');

// Reset error state when URL changes
watch(() => props.logoUrl, () => {
  hasError.value = false;
});
</script>

<template>
  <div
    v-if="logoUrl || showPlaceholder"
    class="flex items-center justify-center bg-white border border-border/50 overflow-hidden"
    :class="[
      config.container,
      rounded ? 'rounded-full' : 'rounded-lg',
    ]"
  >
    <template v-if="logoUrl && !hasError">
      <!-- Storage path - use ImageKit CDN -->
      <ImagePreview
        v-if="isStoragePath(logoUrlNormalized)"
        :storage-path="logoUrlNormalized"
        :width="config.width"
        :height="config.height"
        fit="contain"
        :alt="alt"
        class="w-full h-full"
        img-class="w-full h-full object-contain p-1"
        @error="handleError"
        @load="handleLoad"
      />
      <!-- Legacy URL - direct img tag -->
      <img
        v-else
        :src="logoUrl"
        :alt="alt"
        class="w-full h-full object-contain p-1"
        @error="handleError"
        @load="handleLoad"
      />
    </template>

    <!-- Placeholder/Error state -->
    <Icon
      v-else-if="showPlaceholder"
      icon="lucide:building-2"
      :class="['text-muted-foreground/50', config.icon]"
    />
  </div>
</template>
