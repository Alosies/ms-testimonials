<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { useGetWidgets } from '@/entities/widget';
import { useCurrentContextStore } from '@/shared/currentContext';

const contextStore = useCurrentContextStore();
const { currentOrganizationId } = toRefs(contextStore);

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));

const { widgets, isLoading } = useGetWidgets(variables);

const displayWidgets = computed(() => widgets.value.slice(0, 5));

const getWidgetTypeLabel = (type: string) => {
  switch (type) {
    case 'wall_of_love':
      return 'Wall of Love';
    case 'carousel':
      return 'Carousel';
    case 'single_quote':
      return 'Single Quote';
    default:
      return type;
  }
};

const getWidgetTypeIcon = (type: string) => {
  switch (type) {
    case 'wall_of_love':
      return 'heroicons:squares-2x2';
    case 'carousel':
      return 'heroicons:rectangle-stack';
    case 'single_quote':
      return 'heroicons:chat-bubble-bottom-center-text';
    default:
      return 'heroicons:squares-2x2';
  }
};

const getWidgetTypeColor = (type: string) => {
  switch (type) {
    case 'wall_of_love':
      return 'bg-violet-100 text-violet-600';
    case 'carousel':
      return 'bg-blue-100 text-blue-600';
    case 'single_quote':
      return 'bg-emerald-100 text-emerald-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
        <h2 class="text-lg font-semibold text-gray-900">Widgets</h2>
      </div>
      <RouterLink
        to="/widgets"
        class="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
      >
        View All
        <Icon icon="heroicons:arrow-right" class="w-4 h-4" />
      </RouterLink>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="animate-pulse flex items-center gap-3 p-3">
        <div class="w-10 h-10 bg-gray-200 rounded-lg" />
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div class="h-3 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="widgets.length === 0"
      class="text-center py-8 border border-dashed border-gray-200 rounded-xl"
    >
      <Icon icon="heroicons:squares-2x2" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm mb-4">No widgets yet</p>
      <RouterLink
        to="/widgets/new"
        class="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
      >
        <Icon icon="heroicons:plus" class="w-4 h-4" />
        Create Widget
      </RouterLink>
    </div>

    <!-- Widgets List -->
    <div v-else class="space-y-3">
      <RouterLink
        v-for="widget in displayWidgets"
        :key="widget.id"
        :to="`/widgets/${widget.id}`"
        class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', getWidgetTypeColor(widget.type)]">
          <Icon :icon="getWidgetTypeIcon(widget.type)" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate group-hover:text-violet-600 transition-colors">
            {{ widget.name }}
          </p>
          <p class="text-xs text-gray-500">{{ getWidgetTypeLabel(widget.type) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <span
            :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              widget.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600',
            ]"
          >
            {{ widget.is_active ? 'Active' : 'Inactive' }}
          </span>
          <Icon
            icon="heroicons:chevron-right"
            class="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors"
          />
        </div>
      </RouterLink>
    </div>
  </div>
</template>
