<script setup lang="ts">
/**
 * OrganizationNameField Component
 *
 * Simple name input field with validation.
 * Uses defineModel for v-model binding.
 */
import { computed } from 'vue';
import { Input, Label } from '@testimonials/ui';

const modelValue = defineModel<string>({ required: true });

// Validation
const error = computed(() => {
  if (!modelValue.value.trim()) return 'Organization name is required';
  if (modelValue.value.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
});

// Expose error state for parent validation
defineExpose({ error });
</script>

<template>
  <div class="space-y-2">
    <Label for="org-name">
      Organization Name
      <span class="text-red-500">*</span>
    </Label>
    <Input
      id="org-name"
      v-model="modelValue"
      type="text"
      placeholder="My Company"
      :class="{ 'border-red-300 focus:border-red-500': error }"
    />
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    <p v-else class="text-xs text-gray-500">
      The display name for your organization
    </p>
  </div>
</template>
