<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@testimonials/ui';
import type { WidgetFormState, TestimonialForSelector } from '../../models';
import type { ToastPopupSettings } from '@/entities/widget';

const props = defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();

const settings = computed(() => props.state.settings as ToastPopupSettings);
const testimonial = computed(() => props.testimonials[0]);

const positionClasses = computed(() => {
  const map: Record<string, string> = {
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
  };
  return map[settings.value.position] ?? map['bottom-left'];
});

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
</script>

<template>
  <div class="relative min-h-[220px]">
    <div
      class="text-center py-8 px-4"
      :class="state.theme === 'dark' ? 'text-gray-600' : 'text-gray-300'"
    >
      <Icon icon="heroicons:window" class="h-12 w-12 mx-auto mb-2" />
      <p class="text-xs">Your website content</p>
    </div>

    <div
      v-if="testimonial"
      class="absolute max-w-[260px]"
      :class="positionClasses"
    >
      <div
        class="rounded-xl border p-3 shadow-lg"
        :class="state.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'"
      >
        <button
          v-if="settings.show_dismiss"
          type="button"
          class="absolute top-2 right-2 text-xs leading-none p-1 rounded"
          :class="state.theme === 'dark' ? 'text-gray-500 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'"
        >
          ×
        </button>

        <div v-if="state.show_ratings && testimonial.rating" class="flex gap-0.5 mb-1.5">
          <Icon
            v-for="i in 5"
            :key="i"
            icon="heroicons:star-solid"
            class="h-3 w-3"
            :class="i <= (testimonial.rating ?? 0) ? 'text-amber-400' : 'text-gray-300'"
          />
        </div>

        <p
          v-if="testimonial.content"
          class="text-xs leading-relaxed mb-2 line-clamp-3 pr-4"
          :class="state.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'"
        >
          "{{ testimonial.content }}"
        </p>

        <div class="flex items-center gap-2">
          <Avatar v-if="state.show_avatar" class="h-6 w-6">
            <AvatarImage v-if="testimonial.customer_avatar_url" :src="testimonial.customer_avatar_url" />
            <AvatarFallback class="text-[10px]">{{ getInitials(testimonial.customer_name) }}</AvatarFallback>
          </Avatar>
          <div>
            <p
              class="text-xs font-medium"
              :class="state.theme === 'dark' ? 'text-white' : 'text-gray-900'"
            >
              {{ testimonial.customer_name ?? 'Anonymous' }}
            </p>
            <p
              v-if="state.show_company && testimonial.customer_company"
              class="text-[10px]"
              :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ testimonial.customer_company }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
