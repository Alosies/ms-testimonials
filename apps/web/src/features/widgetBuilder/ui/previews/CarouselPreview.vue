<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { WidgetFormState, TestimonialForSelector } from '../../models';
import TestimonialCard from './TestimonialCard.vue';

const props = defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();

const currentIndex = ref(0);

const currentTestimonial = computed(() => props.testimonials[currentIndex.value]);

function prev() {
  currentIndex.value =
    currentIndex.value > 0 ? currentIndex.value - 1 : props.testimonials.length - 1;
}

function next() {
  currentIndex.value =
    currentIndex.value < props.testimonials.length - 1 ? currentIndex.value + 1 : 0;
}
</script>

<template>
  <div class="p-4">
    <div class="relative">
      <TestimonialCard
        v-if="currentTestimonial"
        :testimonial="currentTestimonial"
        :state="state"
      />

      <div class="flex items-center justify-between mt-3">
        <button
          type="button"
          class="rounded-full p-1.5 transition-colors"
          :class="
            state.theme === 'dark'
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="prev"
        >
          <Icon icon="heroicons:chevron-left" class="h-5 w-5" />
        </button>

        <div class="flex gap-1.5">
          <button
            v-for="(_, i) in testimonials"
            :key="i"
            type="button"
            class="h-2 w-2 rounded-full transition-colors"
            :class="
              i === currentIndex
                ? state.theme === 'dark'
                  ? 'bg-white'
                  : 'bg-gray-900'
                : state.theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
            "
            @click="currentIndex = i"
          />
        </div>

        <button
          type="button"
          class="rounded-full p-1.5 transition-colors"
          :class="
            state.theme === 'dark'
              ? 'text-gray-400 hover:bg-gray-700'
              : 'text-gray-500 hover:bg-gray-100'
          "
          @click="next"
        >
          <Icon icon="heroicons:chevron-right" class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>
