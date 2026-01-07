<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useCheckSlugAvailability } from '../composables/queries';
import { useUpdateOrganization } from '../composables/mutations';
import { isReservedSlug, getReservedSlugMessage } from '../utils';
import type { UserDefaultOrganization } from '../models';
import {
  MediaUploader,
  ImagePreview,
  type UploadResult,
} from '@/entities/media';

const props = defineProps<{
  organization: UserDefaultOrganization;
}>();

const emit = defineEmits<{
  saved: [organization: UserDefaultOrganization];
}>();

// Form state
const name = ref(props.organization.name);
const slug = ref(props.organization.slug);

// Logo state - can be storage path (new uploads) or legacy URL
const logoValue = ref(props.organization.logo_url ?? '');

/**
 * Check if a value is a storage path (vs legacy full URL)
 * Storage paths follow the pattern: {org_id}/{entity_type}/YYYY/MM/DD/med_xxx_timestamp.ext
 * They contain path segments and don't start with http
 */
function isStoragePath(value: string): boolean {
  if (!value) return false;
  // Storage paths don't start with http and contain path segments with media ID
  if (value.startsWith('http://') || value.startsWith('https://')) return false;
  // Check for typical storage path pattern: contains /organization_logo/ or /med_ pattern
  return value.includes('/') && (value.includes('/med_') || value.includes('organization_logo'));
}

// Handle successful upload
function handleLogoUploadSuccess(result: UploadResult) {
  logoValue.value = result.storagePath;
}

// Remove current logo
function handleRemoveLogo() {
  logoValue.value = '';
}

// Track if user has manually touched the slug field in this session
// Starts as false - slug will auto-generate from name until user edits it
const isSlugDirty = ref(false);

// Track the last validated slug
const lastValidatedSlug = ref<string | null>(null);

// Validation state
const { isAvailable: slugAvailable, isChecking: slugChecking, checkAvailability, resetAvailability } = useCheckSlugAvailability();
const { updateOrganization, loading: isSaving } = useUpdateOrganization();

// Can edit slug only during initial setup
const canEditSlug = computed(() => props.organization.setup_status === 'pending_setup');

// Check if slug has valid format for availability check
const hasValidSlugFormat = computed(() => {
  if (!slug.value.trim()) return false;
  if (slug.value.length < 2) return false;
  if (!/^[a-z0-9-]+$/.test(slug.value)) return false;
  if (isReservedSlug(slug.value)) return false;
  return true;
});

// Slug is already validated (matches last check)
const isSlugValidated = computed(() => {
  return slug.value === lastValidatedSlug.value && slugAvailable.value !== null;
});

// Disable check button when slug is already validated or has invalid format
const isCheckButtonDisabled = computed(() => {
  if (slugChecking.value) return true;
  if (!hasValidSlugFormat.value) return true;
  if (isSlugValidated.value) return true;
  return false;
});

// Slug generation from name
function generateSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .trim();
}

// Auto-generate slug from name when slug is editable and user hasn't touched slug field
watch(name, (newName) => {
  if (canEditSlug.value && !isSlugDirty.value) {
    slug.value = generateSlug(newName);
    resetAvailability();
  }
});

// When user manually edits slug, mark it as dirty
function onSlugUpdate(value: string | number) {
  const newSlug = generateSlug(String(value));
  slug.value = newSlug;
  isSlugDirty.value = true;
  // Reset availability when slug changes
  if (newSlug !== lastValidatedSlug.value) {
    resetAvailability();
  }
}

// Check slug availability
async function handleCheckAvailability() {
  if (!canEditSlug.value || !slug.value.trim()) return;

  await checkAvailability(slug.value, props.organization.id);
  lastValidatedSlug.value = slug.value;
}

// Handle blur on slug field - auto-check availability if format is valid
function handleSlugBlur() {
  if (!canEditSlug.value) return;
  if (!hasValidSlugFormat.value) return;
  if (isSlugValidated.value) return; // Already validated this value

  handleCheckAvailability();
}

// Validation
const nameError = computed(() => {
  if (!name.value.trim()) return 'Organization name is required';
  if (name.value.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
});

const slugError = computed(() => {
  if (!canEditSlug.value) return null;
  if (!slug.value.trim()) return 'Slug is required';
  if (slug.value.length < 2) return 'Slug must be at least 2 characters';
  if (!/^[a-z0-9-]+$/.test(slug.value)) return 'Slug can only contain lowercase letters, numbers, and hyphens';
  if (isReservedSlug(slug.value)) return getReservedSlugMessage(slug.value);
  if (slugAvailable.value === false) return 'This slug is already taken';
  return null;
});

// Logo validation - storage paths and valid URLs are both acceptable
const logoError = computed(() => {
  if (!logoValue.value.trim()) return null;
  // Storage paths are always valid
  if (isStoragePath(logoValue.value)) return null;
  // Legacy URLs must be valid
  try {
    new URL(logoValue.value);
    return null;
  } catch {
    return 'Please enter a valid URL or upload an image';
  }
});

// Check if form has changes
const hasChanges = computed(() => {
  const nameChanged = name.value !== props.organization.name;
  const slugChanged = canEditSlug.value && slug.value !== props.organization.slug;
  const logoChanged = logoValue.value !== (props.organization.logo_url ?? '');
  return nameChanged || slugChanged || logoChanged;
});

// Form validity
const isValid = computed(() => {
  if (nameError.value) return false;
  if (slugError.value) return false;
  if (logoError.value) return false;
  // If slug is editable and changed, must be confirmed available and match the validated slug
  if (canEditSlug.value && slug.value !== props.organization.slug) {
    if (slugAvailable.value !== true || slug.value !== lastValidatedSlug.value) {
      return false;
    }
  }
  return true;
});

const canSave = computed(() => {
  return isValid.value && hasChanges.value && !isSaving.value && !slugChecking.value;
});

// Save handler
async function handleSave() {
  if (!canSave.value) return;

  try {
    const changes: Record<string, unknown> = {
      name: name.value.trim(),
      // Store either storage path (new uploads) or legacy URL
      logo_url: logoValue.value.trim() || null,
    };

    // Only include slug if editable
    if (canEditSlug.value) {
      changes.slug = slug.value.trim();
      // Mark setup as completed when saving with slug
      changes.setup_status = 'completed';
    }

    const result = await updateOrganization({
      id: props.organization.id,
      changes,
    });

    if (result) {
      emit('saved', result as UserDefaultOrganization);
    }
  } catch (error) {
    console.error('Failed to save organization settings:', error);
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">Organization Settings</CardTitle>
      <CardDescription>
        Configure your workspace details. These settings help identify your organization across the platform.
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form class="space-y-6" @submit.prevent="handleSave">
        <!-- Organization Name -->
        <div class="space-y-2">
          <Label for="org-name">
            Organization Name
            <span class="text-red-500">*</span>
          </Label>
          <Input
            id="org-name"
            v-model="name"
            type="text"
            placeholder="My Company"
            :class="{ 'border-red-300 focus:border-red-500': nameError }"
          />
          <p v-if="nameError" class="text-xs text-red-500">{{ nameError }}</p>
          <p v-else class="text-xs text-gray-500">
            The display name for your organization
          </p>
        </div>

        <!-- Slug -->
        <div class="space-y-2">
          <Label for="org-slug">
            URL Slug
            <span v-if="canEditSlug" class="text-red-500">*</span>
          </Label>

          <div class="flex gap-2">
            <div class="relative flex-1">
              <Input
                id="org-slug"
                :model-value="slug"
                type="text"
                placeholder="my-company"
                :disabled="!canEditSlug"
                :class="[
                  { 'border-red-300 focus:border-red-500': slugError },
                  { 'border-green-300': canEditSlug && slugAvailable === true && slug === lastValidatedSlug && !slugError },
                  { 'bg-gray-50 text-gray-500': !canEditSlug },
                  'pr-10',
                ]"
                @update:model-value="onSlugUpdate"
                @blur="handleSlugBlur"
              />

              <!-- Status indicator -->
              <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <Icon
                  v-if="slugChecking"
                  icon="heroicons:arrow-path"
                  class="w-4 h-4 text-gray-400 animate-spin"
                />
                <Icon
                  v-else-if="canEditSlug && slugAvailable === true && slug === lastValidatedSlug && !slugError"
                  icon="heroicons:check-circle"
                  class="w-4 h-4 text-green-500"
                />
                <Icon
                  v-else-if="canEditSlug && slugAvailable === false && slug === lastValidatedSlug"
                  icon="heroicons:x-circle"
                  class="w-4 h-4 text-red-500"
                />
                <Icon
                  v-else-if="!canEditSlug"
                  icon="heroicons:lock-closed"
                  class="w-4 h-4 text-gray-400"
                />
              </div>
            </div>

            <!-- Check Availability Button - Always visible when editable, disabled when validated -->
            <Button
              v-if="canEditSlug"
              type="button"
              variant="outline"
              size="sm"
              class="shrink-0 text-xs"
              :disabled="isCheckButtonDisabled"
              @click="handleCheckAvailability"
            >
              <Icon
                v-if="slugChecking"
                icon="heroicons:arrow-path"
                class="w-3.5 h-3.5 mr-1.5 animate-spin"
              />
              Check Availability
            </Button>
          </div>

          <p v-if="slugError" class="text-xs text-red-500">{{ slugError }}</p>
          <p v-else-if="!canEditSlug" class="text-xs text-amber-600 flex items-center gap-1">
            <Icon icon="heroicons:information-circle" class="w-3.5 h-3.5" />
            The URL slug cannot be changed after initial setup
          </p>
          <p v-else-if="slugAvailable === true && slug === lastValidatedSlug" class="text-xs text-green-600 flex items-center gap-1">
            <Icon icon="heroicons:check-circle" class="w-3.5 h-3.5" />
            "{{ slug }}" is available
          </p>
          <p v-else-if="slugAvailable === false && slug === lastValidatedSlug" class="text-xs text-red-500 flex items-center gap-1">
            <Icon icon="heroicons:x-circle" class="w-3.5 h-3.5" />
            "{{ slug }}" is already taken
          </p>
          <p v-else class="text-xs text-gray-500">
            Used in your public URLs (e.g., testimonials.app/{{ slug || 'my-company' }})
          </p>
        </div>

        <!-- Logo Upload -->
        <div class="space-y-2">
          <Label>Organization Logo</Label>

          <!-- Current Logo Preview -->
          <div v-if="logoValue" class="flex items-start gap-4">
            <!-- Preview Image -->
            <div class="relative shrink-0">
              <!-- Storage path - use ImageKit CDN -->
              <ImagePreview
                v-if="isStoragePath(logoValue)"
                :storage-path="logoValue"
                :width="80"
                :height="80"
                fit="contain"
                alt="Organization logo"
                class="w-20 h-20 rounded-lg border border-gray-200 bg-white"
                img-class="w-full h-full object-contain p-1"
              />
              <!-- Legacy URL - direct img tag -->
              <img
                v-else
                :src="logoValue"
                alt="Organization logo"
                class="w-20 h-20 rounded-lg border border-gray-200 bg-white object-contain p-1"
              />
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-2">
              <p class="text-sm text-gray-600">Current logo</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="text-red-600 hover:text-red-700 hover:bg-red-50"
                @click="handleRemoveLogo"
              >
                <Icon icon="lucide:trash-2" class="w-4 h-4 mr-1.5" />
                Remove
              </Button>
            </div>
          </div>

          <!-- Upload Zone -->
          <MediaUploader
            entity-type="organization_logo"
            :entity-id="organization.id"
            :label="logoValue ? 'Upload New Logo' : 'Upload Logo'"
            hint="Recommended: Square image, at least 200x200px"
            @success="handleLogoUploadSuccess"
          />

          <p v-if="logoError" class="text-xs text-red-500">{{ logoError }}</p>
          <p v-else class="text-xs text-gray-500">
            Optional. Your logo will be displayed on forms and widgets.
          </p>
        </div>
      </form>
    </CardContent>

    <CardFooter class="flex justify-end gap-3 border-t pt-4">
      <Button
        type="button"
        :disabled="!canSave"
        :class="{ 'opacity-50 cursor-not-allowed': !canSave }"
        @click="handleSave"
      >
        <Icon
          v-if="isSaving"
          icon="heroicons:arrow-path"
          class="w-4 h-4 mr-2 animate-spin"
        />
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </Button>
    </CardFooter>
  </Card>
</template>
