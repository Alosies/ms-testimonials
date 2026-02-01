<script setup lang="ts">
/**
 * Credit History Page
 * Route: /:org/settings/credits
 *
 * Displays credit transaction history with pagination and filtering.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { CreditHistoryTable } from '@/features/credits';

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
        <div class="max-w-4xl mx-auto px-6 py-6">
          <h1 class="text-2xl font-semibold text-gray-900">Credit History</h1>
          <p class="mt-1 text-sm text-gray-600">
            View your AI credit usage and transaction history.
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-4xl mx-auto px-6 py-8">
        <CreditHistoryTable />
      </div>
    </div>
  </AuthLayout>
</template>
