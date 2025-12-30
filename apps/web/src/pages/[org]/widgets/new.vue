<script setup lang="ts">
/**
 * Create new widget page
 * Route: /:org/widgets/new
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
      <h1 class="text-2xl font-semibold text-gray-900">Create Widget</h1>
      <p class="mt-2 text-gray-600">Create a new testimonial display widget.</p>
      <!-- TODO: Add CreateWidgetFeature component -->
    </div>
  </AuthLayout>
</template>
