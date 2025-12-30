<script setup lang="ts">
/**
 * Testimonials list page
 * Route: /:org/testimonials
 */
import { definePage } from 'unplugin-vue-router/runtime'
import AuthLayout from '@/layouts/AuthLayout.vue'

definePage({
  meta: {
    requiresAuth: true,
  },
})
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <h1 class="text-2xl font-semibold text-gray-900">Testimonials</h1>
      <p class="mt-2 text-gray-600">Manage and approve customer testimonials.</p>
      <!-- TODO: Add TestimonialsListFeature component -->
    </div>
  </AuthLayout>
</template>
