<script setup lang="ts">
/**
 * RatingsBarChart
 *
 * Horizontal bar chart for star rating distribution.
 * Uses native HTML/CSS for reliable rendering.
 */

import { computed } from 'vue';
import { Star } from 'lucide-vue-next';
import type { RatingDistributionEntry } from '../../models';
import { formatPercentage } from '../../functions';

interface Props {
  distribution: RatingDistributionEntry[];
}

const props = defineProps<Props>();

// Sort distribution in descending order (5 stars at top)
const chartData = computed(() =>
  [...props.distribution].sort((a, b) => b.rating - a.rating)
);

// Find max percentage for scaling
const maxPercent = computed(() =>
  Math.max(...chartData.value.map((d) => d.percent), 1)
);
</script>

<template>
  <div v-if="chartData.length > 0" class="space-y-2">
    <div
      v-for="item in chartData"
      :key="item.rating"
      class="flex items-center gap-3"
    >
      <!-- Star rating label -->
      <div class="flex w-12 items-center gap-1 text-sm text-muted-foreground">
        <span>{{ item.rating }}</span>
        <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
      </div>

      <!-- Bar -->
      <div class="h-5 flex-1 overflow-hidden rounded bg-muted">
        <div
          class="h-full rounded bg-yellow-400 transition-all duration-500 ease-out"
          :style="{ width: `${(item.percent / maxPercent) * 100}%` }"
        />
      </div>

      <!-- Percentage -->
      <span class="w-12 text-right text-sm text-muted-foreground">
        {{ formatPercentage(item.percent, 0) }}
      </span>
    </div>
  </div>
</template>
