<script setup lang="ts">
/**
 * Forms list page
 * Route: /:org/forms
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
      <h1 class="text-2xl font-semibold text-gray-900">Forms</h1>
      <p class="mt-2 text-gray-600">Manage your testimonial collection forms.</p>
      <!-- TODO: Add FormsListFeature component -->
    </div>
  </AuthLayout>
</template>
