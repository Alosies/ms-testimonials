<script setup lang="ts">
/**
 * OrganizationSettingsForm Component
 *
 * Composes organization settings form from child components.
 * Handles overall form state, validation, and save operations.
 */
import { ref, computed, useTemplateRef } from 'vue';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useUpdateOrganization } from '../composables/mutations';
import type { UserDefaultOrganization } from '../models';
import OrganizationNameField from './OrganizationNameField.vue';
import OrganizationSlugField from './OrganizationSlugField.vue';
import OrganizationLogoUpload from './OrganizationLogoUpload.vue';

const props = defineProps<{
  organization: UserDefaultOrganization;
}>();

const emit = defineEmits<{
  saved: [organization: UserDefaultOrganization];
}>();

// Form state
const name = ref(props.organization.name);
const slug = ref(props.organization.slug);
const logoValue = ref(props.organization.logo_url ?? '');

// Child component refs for validation
const nameFieldRef = useTemplateRef<InstanceType<typeof OrganizationNameField>>('nameField');
const slugFieldRef = useTemplateRef<InstanceType<typeof OrganizationSlugField>>('slugField');
const logoUploadRef = useTemplateRef<InstanceType<typeof OrganizationLogoUpload>>('logoUpload');

// Update mutation
const { updateOrganization, loading: isSaving } = useUpdateOrganization();

// Can edit slug only during initial setup
const canEditSlug = computed(() => props.organization.setup_status === 'pending_setup');

// Check if form has changes
const hasChanges = computed(() => {
  const nameChanged = name.value !== props.organization.name;
  const slugChanged = canEditSlug.value && slug.value !== props.organization.slug;
  const logoChanged = logoValue.value !== (props.organization.logo_url ?? '');
  return nameChanged || slugChanged || logoChanged;
});

// Form validity - check child component errors
const isValid = computed(() => {
  // Check name field error
  if (nameFieldRef.value?.error) return false;

  // Check slug field error
  if (slugFieldRef.value?.error) return false;

  // Check logo upload error
  if (logoUploadRef.value?.error) return false;

  // If slug is editable and changed, must be confirmed available
  if (canEditSlug.value && slug.value !== props.organization.slug) {
    const slugRef = slugFieldRef.value;
    if (!slugRef) return false;
    if (slugRef.isAvailable !== true) return false;
    if (slug.value !== slugRef.lastValidatedSlug) return false;
  }

  return true;
});

const canSave = computed(() => {
  const slugRef = slugFieldRef.value;
  const isChecking = slugRef?.isChecking ?? false;
  return isValid.value && hasChanges.value && !isSaving.value && !isChecking;
});

// Save handler
async function handleSave() {
  if (!canSave.value) return;

  try {
    const changes: Record<string, unknown> = {
      name: name.value.trim(),
      logo_url: logoValue.value.trim() || null,
    };

    // Only include slug if editable
    if (canEditSlug.value) {
      changes.slug = slug.value.trim();
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
        <OrganizationNameField
          ref="nameField"
          v-model="name"
        />

        <!-- Slug -->
        <OrganizationSlugField
          ref="slugField"
          v-model="slug"
          :organization-id="organization.id"
          :can-edit="canEditSlug"
          :name-value="name"
        />

        <!-- Logo Upload -->
        <OrganizationLogoUpload
          ref="logoUpload"
          v-model="logoValue"
          :organization-id="organization.id"
        />
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
