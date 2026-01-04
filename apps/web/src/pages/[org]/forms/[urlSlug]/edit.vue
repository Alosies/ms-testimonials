<script setup lang="ts">
/**
 * Edit form page - Timeline Editor
 * Route: /:org/forms/:urlSlug/edit
 *
 * Thin wrapper that handles route params and renders the feature component.
 */
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { definePage } from 'unplugin-vue-router/runtime';
import { FormEditPage } from '@/features/createForm/ui';
import { extractEntityIdFromSlug, createPublicFormUrl } from '@/shared/urls';
import { useGetForm } from '@/entities/form';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute();
const router = useRouter();

const urlSlug = computed(() => route.params.urlSlug as string);

const formId = computed(() => {
  const result = extractEntityIdFromSlug(urlSlug.value);
  return result?.isValid ? result.entityId : urlSlug.value;
});

// Fetch form to get name for URL generation
const formVars = computed(() => ({ formId: formId.value }));
const { form } = useGetForm(formVars);

function handleBack() {
  router.push({ name: '/[org]/forms/', params: { org: route.params.org } });
}

function handlePreview() {
  // Open public form URL in new tab
  const formName = form.value?.name ?? 'form';
  const publicUrl = createPublicFormUrl(formName, formId.value);
  window.open(publicUrl, '_blank');
}

function handlePublish() {
  // TODO: Publish form
}
</script>

<template>
  <FormEditPage
    :form-id="formId"
    @back="handleBack"
    @preview="handlePreview"
    @publish="handlePublish"
  />
</template>
