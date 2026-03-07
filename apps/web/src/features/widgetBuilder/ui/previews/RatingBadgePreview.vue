<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { WidgetFormState, TestimonialForSelector } from '../../models';
import type { RatingBadgeSettings } from '@/entities/widget';

const props = defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();

const settings = computed(() => props.state.settings as RatingBadgeSettings);

const avgRating = computed(() => {
  const ratings = props.testimonials
    .map((t) => t.rating)
    .filter((r): r is number => r !== null);
  if (ratings.length === 0) return null;
  return Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10;
});

const totalCount = computed(() => props.testimonials.length);
</script>

<template>
  <div class="flex items-center justify-center p-8">
    <div
      class="inline-flex items-center gap-2"
      :class="[
        settings.style === 'card'
          ? state.theme === 'dark'
            ? 'rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 shadow-sm'
            : 'rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm'
          : '',
      ]"
    >
      <div v-if="avgRating !== null" class="flex gap-0.5">
        <Icon
          v-for="i in 5"
          :key="i"
          icon="heroicons:star-solid"
          class="h-4 w-4"
          :class="i <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-300'"
        />
      </div>

      <span
        v-if="settings.show_average && avgRating !== null"
        class="text-base font-bold"
        :class="state.theme === 'dark' ? 'text-white' : 'text-gray-900'"
      >
        {{ avgRating }}
      </span>

      <span
        v-if="settings.show_count && totalCount > 0 && avgRating !== null"
        class="text-sm"
        :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
      >
        · {{ totalCount }} review{{ totalCount !== 1 ? 's' : '' }}
      </span>
    </div>
  </div>
</template>
