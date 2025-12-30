<script setup lang="ts">
/**
 * Billing settings page
 * Route: /:org/settings/billing
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
      <h1 class="text-2xl font-semibold text-gray-900">Billing</h1>
      <p class="mt-2 text-gray-600">Manage your subscription and billing.</p>
      <!-- TODO: Add BillingSettingsFeature component -->
    </div>
  </AuthLayout>
</template>
