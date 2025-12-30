<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import type { DashboardStats } from '../models';

defineProps<{
  stats: DashboardStats;
  isLoading: boolean;
}>();

const statCards = [
  {
    key: 'formsCount',
    label: 'Active Forms',
    icon: 'heroicons:document-text',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    key: 'testimonialsCount',
    label: 'Total Testimonials',
    icon: 'heroicons:chat-bubble-left-right',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  {
    key: 'pendingCount',
    label: 'Pending Review',
    icon: 'heroicons:clock',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    key: 'widgetsCount',
    label: 'Active Widgets',
    icon: 'heroicons:squares-2x2',
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
  },
] as const;
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="card in statCards"
      :key="card.key"
      class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br"
          :class="card.color"
        >
          <Icon :icon="card.icon" class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="text-xs text-gray-500 font-medium">{{ card.label }}</p>
          <p v-if="isLoading" class="text-2xl font-bold text-gray-300">--</p>
          <p v-else class="text-2xl font-bold text-gray-900">
            {{ stats[card.key] }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
