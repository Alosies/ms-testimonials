<script setup lang="ts">
/**
 * Widgets list page
 * Route: /:org/widgets
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
      <h1 class="text-2xl font-semibold text-gray-900">Widgets</h1>
      <p class="mt-2 text-gray-600">Create and manage embeddable testimonial widgets.</p>
      <!-- TODO: Add WidgetsListFeature component -->
    </div>
  </AuthLayout>
</template>
