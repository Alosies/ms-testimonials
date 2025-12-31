<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { useRouting } from '@/shared/routing';

const { formsPath, testimonialsPath, widgetsPath, settingsPath } = useRouting();

const quickActions = computed(() => [
  {
    name: 'Create Form',
    icon: 'heroicons:plus-circle',
    color: 'from-emerald-400 via-teal-500 to-cyan-500',
    description: 'Start collecting testimonials',
    route: `${formsPath.value}/new`,
  },
  {
    name: 'View Testimonials',
    icon: 'heroicons:chat-bubble-left-right',
    color: 'from-blue-400 via-indigo-500 to-purple-500',
    description: 'Manage your testimonials',
    route: testimonialsPath.value,
  },
  {
    name: 'Create Widget',
    icon: 'heroicons:squares-2x2',
    color: 'from-violet-400 via-purple-500 to-fuchsia-500',
    description: 'Embed on your website',
    route: `${widgetsPath.value}/new`,
  },
  {
    name: 'Settings',
    icon: 'heroicons:cog-6-tooth',
    color: 'from-amber-400 via-orange-500 to-red-500',
    description: 'Configure your account',
    route: settingsPath.value,
  },
]);
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
      <h2 class="text-lg font-semibold text-gray-900">Quick Actions</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RouterLink
        v-for="action in quickActions"
        :key="action.name"
        :to="action.route"
        class="group p-5 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200"
      >
        <div class="flex flex-col items-center text-center space-y-3">
          <div
            class="w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
            :class="action.color"
          >
            <Icon :icon="action.icon" class="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 class="font-medium text-gray-900 mb-1">{{ action.name }}</h3>
            <p class="text-xs text-gray-500">{{ action.description }}</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
