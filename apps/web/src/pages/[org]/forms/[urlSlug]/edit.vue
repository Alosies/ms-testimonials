<script setup lang="ts">
/**
 * Edit form page
 * Route: /:org/forms/:urlSlug/edit
 *
 * Uses Notion-inspired URL pattern: {readable-slug}_{entity_id}
 * The slug is cosmetic; only the entity_id is used for data fetching.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { CreateFormFeature } from '@/features/createForm';
import { extractEntityIdFromSlug } from '@/shared/urls';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute();

const urlSlug = computed(() => route.params.urlSlug as string);

const formId = computed(() => {
  const result = extractEntityIdFromSlug(urlSlug.value);
  // If extraction succeeds, use the entityId; otherwise treat the whole slug as an ID
  return result?.isValid ? result.entityId : urlSlug.value;
});
</script>

<template>
  <AuthLayout>
    <CreateFormFeature :existing-form-id="formId" />
  </AuthLayout>
</template>
