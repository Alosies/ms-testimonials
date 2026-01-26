<script setup lang="ts">
/**
 * FormDashboardMetrics
 *
 * Row of 5 key metric cards with Lucide icons.
 */

import { computed } from 'vue';
import { Users, CheckCircle, Star, Clock, LogOut } from 'lucide-vue-next';
import type { SessionStats, RatingData } from '../models';
import { formatPercentage, formatDuration, formatNumber, formatRating } from '../functions';
import FormDashboardMetricCard from './FormDashboardMetricCard.vue';

interface Props {
  stats: SessionStats | null;
  ratings: RatingData | null;
}

const props = defineProps<Props>();

const formattedCompletionRate = computed(() =>
  formatPercentage(props.stats?.completionRate.value ?? null)
);

const formattedAbandonmentRate = computed(() =>
  formatPercentage(props.stats?.abandonmentRate.value ?? null)
);

const formattedAvgTime = computed(() =>
  formatDuration(props.stats?.avgCompletionTimeMs ?? null)
);

const formattedAvgRating = computed(() =>
  formatRating(props.ratings?.avgRating ?? null)
);
</script>

<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
    <!-- Total Sessions -->
    <FormDashboardMetricCard
      label="Sessions"
      :value="formatNumber(stats?.totalSessions ?? null)"
      :icon="Users"
    />

    <!-- Completion Rate -->
    <FormDashboardMetricCard
      label="Completion Rate"
      :value="formattedCompletionRate"
      :icon="CheckCircle"
    />

    <!-- Average Rating (conditional) -->
    <FormDashboardMetricCard
      v-if="ratings?.hasRatingStep"
      label="Avg. Rating"
      :value="formattedAvgRating"
      :icon="Star"
    />

    <!-- Average Time -->
    <FormDashboardMetricCard
      label="Avg. Time"
      :value="formattedAvgTime"
      :icon="Clock"
    />

    <!-- Abandonment Rate -->
    <FormDashboardMetricCard
      label="Abandonment"
      :value="formattedAbandonmentRate"
      :icon="LogOut"
    />
  </div>
</template>
