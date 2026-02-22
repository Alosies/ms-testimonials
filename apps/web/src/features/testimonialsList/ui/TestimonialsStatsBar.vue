<script setup lang="ts">
import { Skeleton } from '@testimonials/ui';
import type { TestimonialsStats } from '@/entities/testimonial';

interface Props {
  stats: TestimonialsStats;
  loading?: boolean;
}

defineProps<Props>();

const statItems = [
  { key: 'total' as const, label: 'Total', color: 'text-foreground', bg: 'bg-muted' },
  { key: 'pending' as const, label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { key: 'approved' as const, label: 'Approved', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  { key: 'rejected' as const, label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
];
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
    <template v-if="loading">
      <Skeleton v-for="i in 4" :key="i" class="h-[72px] rounded-xl" />
    </template>
    <template v-else>
      <div
        v-for="item in statItems"
        :key="item.key"
        class="rounded-xl border border-border p-4"
        :class="item.bg"
      >
        <p class="text-xs font-medium text-muted-foreground">{{ item.label }}</p>
        <p class="text-2xl font-semibold mt-1" :class="item.color">
          {{ stats[item.key] }}
        </p>
      </div>
    </template>
  </div>
</template>
