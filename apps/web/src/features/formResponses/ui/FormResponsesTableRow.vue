<script setup lang="ts">
import type { AggregatedSession } from '../models';

defineProps<{
  session: AggregatedSession;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();

const getStatusConfig = (status: AggregatedSession['status']) => {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        textClass: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'abandoned':
      return {
        label: 'Abandoned',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        textClass: 'text-red-700 dark:text-red-400',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        textClass: 'text-amber-700 dark:text-amber-400',
      };
  }
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatStepType = (stepType: string | null): string => {
  if (!stepType) return '—';

  // Convert snake_case to Title Case
  return stepType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
</script>

<template>
  <tr
    class="group transition-colors cursor-pointer"
    :class="[
      isSelected
        ? 'bg-primary/5 hover:bg-primary/10'
        : 'hover:bg-muted/30'
    ]"
    @click="emit('select')"
  >
    <!-- Session ID -->
    <td class="py-3 px-4">
      <span class="font-mono text-sm text-muted-foreground">
        {{ session.sessionId.slice(0, 8) }}
      </span>
    </td>

    <!-- Status -->
    <td class="py-3 px-4">
      <span
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
        :class="[getStatusConfig(session.status).bgClass, getStatusConfig(session.status).textClass]"
      >
        {{ getStatusConfig(session.status).label }}
      </span>
    </td>

    <!-- Events Count -->
    <td class="py-3 px-4 text-center hidden md:table-cell">
      <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        {{ session.eventCount }}
      </span>
    </td>

    <!-- Last Step -->
    <td class="py-3 px-4 hidden lg:table-cell">
      <span class="text-sm text-muted-foreground">
        <template v-if="session.lastStepIndex !== null">
          Step {{ session.lastStepIndex + 1 }}
          <span v-if="session.lastStepType" class="text-xs ml-1">
            ({{ formatStepType(session.lastStepType) }})
          </span>
        </template>
        <template v-else>
          {{ formatStepType(session.lastStepType) }}
        </template>
      </span>
    </td>

    <!-- Duration -->
    <td class="py-3 px-4 hidden md:table-cell">
      <span class="text-sm text-muted-foreground font-mono">
        {{ session.duration }}
      </span>
    </td>

    <!-- Started -->
    <td class="py-3 px-4 hidden lg:table-cell">
      <span class="text-sm text-muted-foreground">
        {{ formatRelativeTime(session.startedAt) }}
      </span>
    </td>

    <!-- Last Activity -->
    <td class="py-3 px-4">
      <span class="text-sm text-muted-foreground">
        {{ formatRelativeTime(session.lastActivityAt) }}
      </span>
    </td>
  </tr>
</template>
