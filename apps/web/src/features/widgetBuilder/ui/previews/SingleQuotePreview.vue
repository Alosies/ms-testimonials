<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@testimonials/ui';
import type { WidgetFormState, TestimonialForSelector } from '../../models';

const props = defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();

const testimonial = computed(() => props.testimonials[0]);

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
</script>

<template>
  <div v-if="testimonial" class="p-6 text-center">
    <Icon
      icon="heroicons:chat-bubble-bottom-center-text"
      class="h-8 w-8 mx-auto mb-4"
      :class="state.theme === 'dark' ? 'text-gray-600' : 'text-gray-300'"
    />

    <blockquote
      class="text-lg leading-relaxed mb-4 italic"
      :class="state.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'"
    >
      "{{ testimonial.content ?? 'No content' }}"
    </blockquote>

    <div v-if="state.show_ratings && testimonial.rating" class="flex justify-center gap-0.5 mb-3">
      <Icon
        v-for="i in 5"
        :key="i"
        icon="heroicons:star-solid"
        class="h-4 w-4"
        :class="i <= (testimonial.rating ?? 0) ? 'text-amber-400' : 'text-gray-300'"
      />
    </div>

    <div class="flex items-center justify-center gap-2">
      <Avatar v-if="state.show_avatar" class="h-10 w-10">
        <AvatarImage v-if="testimonial.customer_avatar_url" :src="testimonial.customer_avatar_url" />
        <AvatarFallback>{{ getInitials(testimonial.customer_name) }}</AvatarFallback>
      </Avatar>
      <div>
        <p
          class="font-medium"
          :class="state.theme === 'dark' ? 'text-white' : 'text-gray-900'"
        >
          {{ testimonial.customer_name ?? 'Anonymous' }}
        </p>
        <p
          v-if="state.show_company && testimonial.customer_company"
          class="text-sm"
          :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ testimonial.customer_company }}
        </p>
      </div>
    </div>
  </div>
</template>
