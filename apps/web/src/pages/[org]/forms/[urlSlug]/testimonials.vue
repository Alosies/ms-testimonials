<script setup lang="ts">
/**
 * Form Testimonials page
 * Route: /:org/forms/:urlSlug/testimonials
 *
 * Shows testimonials collected from this specific form.
 */
import { definePage } from 'unplugin-vue-router/runtime';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { extractEntityIdFromSlug } from '@/shared/urls';
import { FormSubpageHeader } from '@/features/formDashboard';
import FormSubpageLayout from '@/layouts/FormSubpageLayout.vue';
import { TestimonialsListFeature } from '@/features/testimonialsList';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute();

const urlSlug = computed(() => route.params.urlSlug as string);
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value));
const formId = computed(() => entityInfo.value?.entityId ?? null);

// Create a FormRef object for navigation
const formRef = computed(() => ({
  id: formId.value ?? '',
  name: entityInfo.value?.slug ?? 'form',
}));
</script>

<template>
  <FormSubpageLayout>
    <div v-if="!entityInfo?.isValid" class="text-destructive">
      Invalid form URL
    </div>
    <template v-else-if="formId">
      <FormSubpageHeader
        :form-ref="formRef"
        title="Testimonials"
        subtitle="Testimonials collected from this form"
      />

      <TestimonialsListFeature :form-id="formId" />
    </template>
  </FormSubpageLayout>
</template>
