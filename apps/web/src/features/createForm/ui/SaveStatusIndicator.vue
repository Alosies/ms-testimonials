<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { SaveStatus } from '../models';

const props = defineProps<{
  status: SaveStatus;
  lastSavedAt?: Date | null;
  error?: string | null;
}>();

const emit = defineEmits<{
  retry: [];
}>();

const formattedTime = computed(() => {
  if (!props.lastSavedAt) return null;
  return props.lastSavedAt.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
});

const statusConfig = computed(() => {
  switch (props.status) {
    case 'saving':
      return {
        icon: 'lucide:loader-2',
        text: 'Saving...',
        iconClass: 'animate-spin text-gray-400',
        textClass: 'text-gray-500',
      };
    case 'saved':
      return {
        icon: 'lucide:check',
        text: formattedTime.value ? `Saved at ${formattedTime.value}` : 'Saved',
        iconClass: 'text-emerald-500',
        textClass: 'text-emerald-600',
      };
    case 'error':
      return {
        icon: 'lucide:alert-circle',
        text: 'Save failed',
        iconClass: 'text-red-500',
        textClass: 'text-red-600',
      };
    default:
      return null;
  }
});

const isVisible = computed(() => props.status !== 'idle');
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible && statusConfig"
      class="flex items-center gap-1.5 text-sm"
    >
      <Icon :icon="statusConfig.icon" :class="['h-4 w-4', statusConfig.iconClass]" />
      <span :class="statusConfig.textClass">{{ statusConfig.text }}</span>

      <!-- Retry button for error state -->
      <button
        v-if="status === 'error'"
        class="ml-1 text-xs text-red-600 underline hover:text-red-700"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>
  </Transition>
</template>
