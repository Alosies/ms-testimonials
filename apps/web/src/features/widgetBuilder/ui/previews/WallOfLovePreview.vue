<script setup lang="ts">
import type { WidgetFormState, TestimonialForSelector } from '../../models';
import TestimonialCard from './TestimonialCard.vue';

defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();
</script>

<template>
  <div class="columns-1 sm:columns-2 gap-3 p-4 space-y-3">
    <TestimonialCard
      v-for="t in testimonials"
      :key="t.id"
      :testimonial="t"
      :state="state"
      class="break-inside-avoid"
    />
  </div>
</template>
