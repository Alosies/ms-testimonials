<script setup lang="ts">
/**
 * Billing Settings Page
 * Route: /:org/settings/billing
 *
 * Shows current plan details and usage limits.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import SettingsTabNav from '@/shared/ui/SettingsTabNav.vue';
import { BillingPlanCard } from '@/features/billing';

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

        <!-- Billing Plan Card -->
        <BillingPlanCard />
      </div>
    </div>
  </AuthLayout>
</template>
