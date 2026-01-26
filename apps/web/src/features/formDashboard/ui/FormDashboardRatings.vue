<script setup lang="ts">
/**
 * FormDashboardRatings
 *
 * Rating display with star icons and Unovis distribution chart.
 */

import { computed } from 'vue';
import { Star } from 'lucide-vue-next';
import { Card } from '@testimonials/ui';
import type { RatingData } from '../models';
import { formatRating, formatNumber } from '../functions';
import { RatingsBarChart } from './charts';

interface Props {
  ratings: RatingData | null;
}

const props = defineProps<Props>();

const hasData = computed(() =>
  props.ratings?.hasRatingStep && (props.ratings?.totalRatings ?? 0) > 0
);

const avgRating = computed(() => props.ratings?.avgRating ?? null);
const totalRatings = computed(() => props.ratings?.totalRatings ?? 0);
const distribution = computed(() => props.ratings?.distribution ?? []);

// Generate array for filled/unfilled stars
const starsDisplay = computed(() => {
  const rating = avgRating.value ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return Array.from({ length: 5 }, (_, i) => ({
    filled: i < fullStars,
    half: i === fullStars && hasHalf,
  }));
});
</script>

<template>
  <Card class="p-5 backdrop-blur-sm bg-card/80 border-border/50">
    <h3 class="mb-4 text-lg font-medium text-foreground">
      Ratings
    </h3>

    <!-- No rating step -->
    <div
      v-if="!ratings?.hasRatingStep"
      class="py-8 text-center text-muted-foreground"
    >
      This form doesn't have a rating step
    </div>

    <!-- No ratings yet -->
    <div
      v-else-if="!hasData"
      class="py-8 text-center text-muted-foreground"
    >
      No ratings collected yet
    </div>

    <!-- Rating data -->
    <div v-else class="space-y-4">
      <!-- Average rating display -->
      <div class="text-center">
        <div class="flex justify-center gap-0.5">
          <Star
            v-for="(star, i) in starsDisplay"
            :key="i"
            class="h-6 w-6"
            :class="[
              star.filled || star.half
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            ]"
          />
        </div>
        <div class="mt-2 text-2xl font-semibold text-foreground">
          {{ formatRating(avgRating) }}
        </div>
        <div class="text-sm text-muted-foreground">
          out of 5 (from {{ formatNumber(totalRatings) }} responses)
        </div>
      </div>

      <!-- Distribution chart -->
      <RatingsBarChart :distribution="distribution" />
    </div>
  </Card>
</template>
