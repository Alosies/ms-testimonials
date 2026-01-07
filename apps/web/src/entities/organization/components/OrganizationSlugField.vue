<script setup lang="ts">
/**
 * OrganizationSlugField Component
 *
 * Slug input with availability checking and auto-generation from name.
 * Complex field with external validation via GraphQL.
 */
import { ref, computed, watch } from 'vue';
import { Button, Input, Label } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useCheckSlugAvailability } from '../composables/queries';
import { isReservedSlug, getReservedSlugMessage } from '../utils';

const props = defineProps<{
  organizationId: string;
  canEdit: boolean;
  nameValue: string;
}>();

const modelValue = defineModel<string>({ required: true });

// Track if user has manually touched the slug field
const isSlugDirty = ref(false);

// Track the last validated slug
const lastValidatedSlug = ref<string | null>(null);

// Slug availability composable
const { isAvailable, isChecking, checkAvailability, resetAvailability } = useCheckSlugAvailability();

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

// Auto-generate slug from name when editable and user hasn't touched slug field
watch(() => props.nameValue, (newName) => {
  if (props.canEdit && !isSlugDirty.value) {
    modelValue.value = generateSlug(newName);
    resetAvailability();
  }
});

// When user manually edits slug
function onSlugUpdate(value: string | number) {
  const newSlug = generateSlug(String(value));
  modelValue.value = newSlug;
  isSlugDirty.value = true;
  // Reset availability when slug changes
  if (newSlug !== lastValidatedSlug.value) {
    resetAvailability();
  }
}

// Check if slug has valid format for availability check
const hasValidSlugFormat = computed(() => {
  if (!modelValue.value.trim()) return false;
  if (modelValue.value.length < 2) return false;
  if (!/^[a-z0-9-]+$/.test(modelValue.value)) return false;
  if (isReservedSlug(modelValue.value)) return false;
  return true;
});

// Slug is already validated (matches last check)
const isSlugValidated = computed(() => {
  return modelValue.value === lastValidatedSlug.value && isAvailable.value !== null;
});

// Disable check button when slug is already validated or has invalid format
const isCheckButtonDisabled = computed(() => {
  if (isChecking.value) return true;
  if (!hasValidSlugFormat.value) return true;
  if (isSlugValidated.value) return true;
  return false;
});

// Check slug availability
async function handleCheckAvailability() {
  if (!props.canEdit || !modelValue.value.trim()) return;
  await checkAvailability(modelValue.value, props.organizationId);
  lastValidatedSlug.value = modelValue.value;
}

// Handle blur on slug field - auto-check availability if format is valid
function handleSlugBlur() {
  if (!props.canEdit) return;
  if (!hasValidSlugFormat.value) return;
  if (isSlugValidated.value) return;
  handleCheckAvailability();
}

// Validation error
const error = computed(() => {
  if (!props.canEdit) return null;
  if (!modelValue.value.trim()) return 'Slug is required';
  if (modelValue.value.length < 2) return 'Slug must be at least 2 characters';
  if (!/^[a-z0-9-]+$/.test(modelValue.value)) return 'Slug can only contain lowercase letters, numbers, and hyphens';
  if (isReservedSlug(modelValue.value)) return getReservedSlugMessage(modelValue.value);
  if (isAvailable.value === false) return 'This slug is already taken';
  return null;
});

// Expose state for parent validation
defineExpose({
  error,
  isAvailable,
  lastValidatedSlug,
  isChecking,
});
</script>

<template>
  <div class="space-y-2">
    <Label for="org-slug">
      URL Slug
      <span v-if="canEdit" class="text-red-500">*</span>
    </Label>

    <div class="flex gap-2">
      <div class="relative flex-1">
        <Input
          id="org-slug"
          :model-value="modelValue"
          type="text"
          placeholder="my-company"
          :disabled="!canEdit"
          :class="[
            { 'border-red-300 focus:border-red-500': error },
            { 'border-green-300': canEdit && isAvailable === true && modelValue === lastValidatedSlug && !error },
            { 'bg-gray-50 text-gray-500': !canEdit },
            'pr-10',
          ]"
          @update:model-value="onSlugUpdate"
          @blur="handleSlugBlur"
        />

        <!-- Status indicator -->
        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          <Icon
            v-if="isChecking"
            icon="heroicons:arrow-path"
            class="w-4 h-4 text-gray-400 animate-spin"
          />
          <Icon
            v-else-if="canEdit && isAvailable === true && modelValue === lastValidatedSlug && !error"
            icon="heroicons:check-circle"
            class="w-4 h-4 text-green-500"
          />
          <Icon
            v-else-if="canEdit && isAvailable === false && modelValue === lastValidatedSlug"
            icon="heroicons:x-circle"
            class="w-4 h-4 text-red-500"
          />
          <Icon
            v-else-if="!canEdit"
            icon="heroicons:lock-closed"
            class="w-4 h-4 text-gray-400"
          />
        </div>
      </div>

      <!-- Check Availability Button -->
      <Button
        v-if="canEdit"
        type="button"
        variant="outline"
        size="sm"
        class="shrink-0 text-xs"
        :disabled="isCheckButtonDisabled"
        @click="handleCheckAvailability"
      >
        <Icon
          v-if="isChecking"
          icon="heroicons:arrow-path"
          class="w-3.5 h-3.5 mr-1.5 animate-spin"
        />
        Check Availability
      </Button>
    </div>

    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else-if="!canEdit" class="text-xs text-amber-600 flex items-center gap-1">
      <Icon icon="heroicons:information-circle" class="w-3.5 h-3.5" />
      The URL slug cannot be changed after initial setup
    </p>
    <p v-else-if="isAvailable === true && modelValue === lastValidatedSlug" class="text-xs text-green-600 flex items-center gap-1">
      <Icon icon="heroicons:check-circle" class="w-3.5 h-3.5" />
      "{{ modelValue }}" is available
    </p>
    <p v-else-if="isAvailable === false && modelValue === lastValidatedSlug" class="text-xs text-red-500 flex items-center gap-1">
      <Icon icon="heroicons:x-circle" class="w-3.5 h-3.5" />
      "{{ modelValue }}" is already taken
    </p>
    <p v-else class="text-xs text-gray-500">
      Used in your public URLs (e.g., testimonials.app/{{ modelValue || 'my-company' }})
    </p>
  </div>
</template>
