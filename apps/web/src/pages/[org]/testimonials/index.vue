<script setup lang="ts">
/**
 * Testimonials list page
 * Route: /:org/testimonials
 */
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { TestimonialsListFeature } from '@/features/testimonialsList';

definePage({
  meta: {
    requiresAuth: true,
  },
});
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-foreground">Testimonials</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage and approve customer testimonials across all forms.
        </p>
      </div>

      <TestimonialsListFeature />
    </div>
  </AuthLayout>
</template>
