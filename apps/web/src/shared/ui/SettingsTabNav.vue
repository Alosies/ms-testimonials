<script setup lang="ts">
/**
 * Settings Tab Navigation
 *
 * Horizontal tab navigation for settings pages (Linear/Notion style).
 * Provides consistent navigation across all settings sub-pages.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';
import { Icon } from '@testimonials/icons';

const route = useRoute();

// Settings navigation tabs with path suffixes (relative to org root)
const settingsTabs = [
  {
    label: 'General',
    icon: 'heroicons:cog-6-tooth',
    pathSuffix: '',
  },
  {
    label: 'Team',
    icon: 'heroicons:user-group',
    pathSuffix: '/team',
  },
  {
    label: 'Billing',
    icon: 'heroicons:credit-card',
    pathSuffix: '/billing',
  },
  {
    label: 'AI',
    icon: 'heroicons:sparkles',
    pathSuffix: '/ai',
  },
];

// Compute base settings path from current route (extract org slug)
const settingsBasePath = computed(() => {
  // Extract org slug from route params
  const orgSlug = route.params.org as string;
  return `/${orgSlug}/settings`;
});

// Build tabs with full paths and active state
const tabsWithActive = computed(() => {
  const currentPath = route.path;
  const basePath = settingsBasePath.value;

  return settingsTabs.map((tab) => {
    const fullPath = `${basePath}${tab.pathSuffix}`;
    return {
      ...tab,
      path: fullPath,
      isActive: currentPath === fullPath,
    };
  });
});
</script>

<template>
  <nav class="flex items-center gap-1 border-b border-gray-200">
    <RouterLink
      v-for="tab in tabsWithActive"
      :key="tab.path"
      :to="tab.path"
      :class="[
        'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px',
        tab.isActive
          ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
      ]"
    >
      <Icon :icon="tab.icon" class="w-4 h-4" />
      <span>{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>
