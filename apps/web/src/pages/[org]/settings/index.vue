<script setup lang="ts">
/**
 * Organization settings page
 * Route: /:org/settings
 */
import { toRefs } from 'vue';
import { definePage } from 'unplugin-vue-router/runtime';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { OrganizationSettingsForm, useOrganizationStore } from '@/entities/organization';
import type { UserDefaultOrganization } from '@/entities/organization';
import { useRouting } from '@/shared/routing';
import SettingsTabNav from '@/shared/ui/SettingsTabNav.vue';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const organizationStore = useOrganizationStore();
const { currentOrganization } = toRefs(organizationStore);
const { goToDashboard } = useRouting();

// Handle successful save
function handleSaved(updatedOrg: UserDefaultOrganization) {
  // Refetch organization data to update the store
  organizationStore.refetchOrganization();
  // If setup was just completed, navigate to dashboard
  if (updatedOrg.setup_status === 'completed') {
    goToDashboard();
  }
}
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
        <!-- Settings Tab Navigation (Linear/Notion style) -->
        <SettingsTabNav class="mb-8" />

        <!-- Organization Settings Form -->
        <OrganizationSettingsForm
          v-if="currentOrganization"
          :organization="currentOrganization"
          @saved="handleSaved"
        />

        <!-- Loading state -->
        <div v-else class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
            <p class="mt-4 text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
