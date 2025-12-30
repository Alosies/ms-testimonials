<script setup lang="ts">
/**
 * Team management settings page
 * Route: /:org/settings/team
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
      <h1 class="text-2xl font-semibold text-gray-900">Team Settings</h1>
      <p class="mt-2 text-gray-600">Manage team members and roles.</p>
      <!-- TODO: Add TeamSettingsFeature component -->
    </div>
  </AuthLayout>
</template>
