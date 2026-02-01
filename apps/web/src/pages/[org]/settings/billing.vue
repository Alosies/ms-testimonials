<script setup lang="ts">
/**
 * Billing settings page
 * Route: /:org/settings/billing
 */
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import SettingsTabNav from '@/shared/ui/SettingsTabNav.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});
</script>

<template>
  <AuthLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-6 py-6">
          <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
          <p class="mt-1 text-sm text-gray-600">
            Manage your organization settings and preferences.
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Settings Tab Navigation -->
        <SettingsTabNav class="mb-8" />

        <!-- Billing Content -->
        <div class="bg-white border border-gray-200 rounded-xl p-6">
          <h3 class="text-lg font-medium text-gray-900">Subscription & Billing</h3>
          <p class="mt-1 text-sm text-gray-600">
            Manage your subscription plan and payment methods.
          </p>
          <!-- TODO: Add BillingSettingsFeature component -->
          <div class="mt-6 text-center py-12 text-gray-400">
            Billing management coming soon
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
