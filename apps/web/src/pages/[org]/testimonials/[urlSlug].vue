<script setup lang="ts">
/**
 * Testimonial detail page
 * Route: /:org/testimonials/:urlSlug
 *
 * Thin wrapper — delegates to TestimonialDetailView feature component.
 * ADR-025 Phase 4.3
 */
import { definePage } from 'unplugin-vue-router/runtime';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button } from '@testimonials/ui';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { extractEntityIdFromSlug } from '@/shared/urls';
import { useRouting } from '@/shared/routing';
import { TestimonialDetailView } from '@/features/testimonialsList';

definePage({
  meta: { requiresAuth: true },
});

const route = useRoute();
const { goToTestimonials } = useRouting();

const urlSlug = computed(() => route.params.urlSlug as string);
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value));
const testimonialId = computed(() => entityInfo.value?.entityId ?? '');
</script>

<template>
  <AuthLayout>
    <div class="p-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" class="mb-4" @click="goToTestimonials()">
        <Icon icon="heroicons:arrow-left" class="h-4 w-4 mr-2" />
        Back to Testimonials
      </Button>

      <div v-if="!entityInfo?.isValid" class="text-destructive">
        Invalid testimonial URL
      </div>

      <TestimonialDetailView
        v-else
        :testimonial-id="testimonialId"
      />
    </div>
  </AuthLayout>
</template>
