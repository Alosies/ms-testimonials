<script setup lang="ts">
import { computed } from 'vue';
import type { WidgetFormState, TestimonialForSelector } from '../models';
import WallOfLovePreview from './previews/WallOfLovePreview.vue';
import CarouselPreview from './previews/CarouselPreview.vue';
import SingleQuotePreview from './previews/SingleQuotePreview.vue';
import MarqueePreview from './previews/MarqueePreview.vue';
import RatingBadgePreview from './previews/RatingBadgePreview.vue';
import AvatarsBarPreview from './previews/AvatarsBarPreview.vue';
import ToastPopupPreview from './previews/ToastPopupPreview.vue';

const props = defineProps<{
  state: WidgetFormState;
  testimonials: TestimonialForSelector[];
}>();

const displayTestimonials = computed(() => {
  if (props.state.max_display) {
    return props.testimonials.slice(0, props.state.max_display);
  }
  return props.testimonials;
});

// Types that can render without testimonials (aggregate-based)
const typesWithoutTestimonials: string[] = ['rating_badge', 'avatars_bar'];
const needsTestimonials = computed(
  () => !typesWithoutTestimonials.includes(props.state.type),
);
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-3 block">Preview</label>
    <div
      class="rounded-lg border border-border overflow-hidden min-h-[200px]"
      :class="state.theme === 'dark' ? 'bg-gray-900' : 'bg-white'"
    >
      <div
        v-if="needsTestimonials && displayTestimonials.length === 0"
        class="flex items-center justify-center h-48"
      >
        <p class="text-sm text-muted-foreground">
          Select testimonials to see a preview
        </p>
      </div>

      <WallOfLovePreview
        v-else-if="state.type === 'wall_of_love'"
        :testimonials="displayTestimonials"
        :state="state"
      />
      <CarouselPreview
        v-else-if="state.type === 'carousel'"
        :testimonials="displayTestimonials"
        :state="state"
      />
      <SingleQuotePreview
        v-else-if="state.type === 'single_quote'"
        :testimonials="displayTestimonials"
        :state="state"
      />
      <MarqueePreview
        v-else-if="state.type === 'marquee'"
        :testimonials="displayTestimonials"
        :state="state"
      />
      <RatingBadgePreview
        v-else-if="state.type === 'rating_badge'"
        :testimonials="displayTestimonials"
        :state="state"
      />
      <AvatarsBarPreview
        v-else-if="state.type === 'avatars_bar'"
        :testimonials="displayTestimonials"
        :state="state"
      />
      <ToastPopupPreview
        v-else-if="state.type === 'toast_popup'"
        :testimonials="displayTestimonials"
        :state="state"
      />
    </div>
  </div>
</template>
