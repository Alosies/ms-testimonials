<script setup lang="ts">
import { toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { useOrganizationStore } from '@/entities/organization';
import { useRouting } from '@/shared/routing';

const { showSetupIndicator } = toRefs(useOrganizationStore());
const { goToSettings } = useRouting();
</script>

<template>
  <div
    v-if="showSetupIndicator"
    class="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5"
  >
    <!-- Background decoration -->
    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-100/50 rounded-full blur-2xl" />
    <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-orange-100/50 rounded-full blur-xl" />

    <div class="relative flex items-start gap-4">
      <!-- Icon (matches sidebar) -->
      <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
        <Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-amber-600" />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-semibold text-gray-900 mb-1">
          Complete your workspace setup
        </h3>
        <p class="text-xs text-gray-600 mb-3">
          Add your business details, logo, and customize your workspace to start collecting testimonials.
        </p>

        <!-- CTA Button -->
        <button
          @click="goToSettings"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors duration-200"
        >
          <Icon icon="heroicons:cog-6-tooth" class="w-3.5 h-3.5" />
          Complete Setup
          <Icon icon="heroicons:arrow-right" class="w-3 h-3" />
        </button>
      </div>

      <!-- Status badge (matches sidebar "Pending" indicator) -->
      <div class="hidden sm:flex items-center">
        <span class="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          <Icon icon="heroicons:exclamation-circle" class="w-3 h-3" />
          Pending
        </span>
      </div>
    </div>
  </div>
</template>
