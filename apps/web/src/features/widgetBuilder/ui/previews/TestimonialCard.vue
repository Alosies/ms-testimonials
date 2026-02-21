<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@testimonials/ui';
import type { WidgetFormState, TestimonialForSelector } from '../../models';

defineProps<{
  testimonial: TestimonialForSelector;
  state: WidgetFormState;
}>();

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
  <div
    class="rounded-lg border p-4"
    :class="state.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'"
  >
    <div v-if="state.show_ratings && testimonial.rating" class="flex gap-0.5 mb-2">
      <Icon
        v-for="i in 5"
        :key="i"
        icon="heroicons:star-solid"
        class="h-4 w-4"
        :class="i <= (testimonial.rating ?? 0) ? 'text-amber-400' : 'text-gray-300'"
      />
    </div>

    <p
      class="text-sm leading-relaxed mb-3"
      :class="state.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'"
    >
      "{{ testimonial.content ?? 'No content' }}"
    </p>

    <div class="flex items-center gap-2">
      <Avatar v-if="state.show_avatar" class="h-8 w-8">
        <AvatarImage v-if="testimonial.customer_avatar_url" :src="testimonial.customer_avatar_url" />
        <AvatarFallback class="text-xs">{{ getInitials(testimonial.customer_name) }}</AvatarFallback>
      </Avatar>
      <div>
        <p
          class="text-sm font-medium"
          :class="state.theme === 'dark' ? 'text-white' : 'text-gray-900'"
        >
          {{ testimonial.customer_name ?? 'Anonymous' }}
        </p>
        <p
          v-if="state.show_company && testimonial.customer_company"
          class="text-xs"
          :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
        >
          {{ testimonial.customer_company }}
        </p>
      </div>
    </div>
  </div>
</template>
