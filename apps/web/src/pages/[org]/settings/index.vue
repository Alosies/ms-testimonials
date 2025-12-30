<script setup lang="ts">
/**
 * Organization settings page
 * Route: /:org/settings
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
      <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
      <p class="mt-2 text-gray-600">Manage your organization settings.</p>
      <!-- TODO: Add SettingsOverviewFeature component -->
    </div>
  </AuthLayout>
</template>
