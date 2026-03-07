<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@testimonials/ui';
import type { WidgetFormState, TestimonialForSelector } from '../../models';
import type { MarqueeSettings } from '@/entities/widget';

const props = defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();

const settings = computed(() => props.state.settings as MarqueeSettings);
const isCompact = computed(() => settings.value.card_style === 'compact');

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
</script>

<template>
  <div class="overflow-hidden py-2 px-1">
    <div
      class="flex gap-3 animate-marquee-preview"
      :class="settings.direction === 'right' ? 'animate-marquee-reverse' : ''"
    >
      <template v-for="pass in 2" :key="pass">
        <template v-if="isCompact">
          <div
            v-for="t in testimonials"
            :key="`${pass}-${t.id}`"
            class="flex items-center gap-2 rounded-lg border px-3 py-2 shrink-0"
            :class="state.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'"
          >
            <div v-if="state.show_ratings && t.rating" class="flex gap-0.5 shrink-0">
              <Icon
                v-for="i in 5"
                :key="i"
                icon="heroicons:star-solid"
                class="h-3 w-3"
                :class="i <= (t.rating ?? 0) ? 'text-amber-400' : 'text-gray-300'"
              />
            </div>
            <span
              class="text-sm truncate max-w-[200px]"
              :class="state.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'"
            >
              "{{ t.content ?? '' }}"
            </span>
            <span
              v-if="t.customer_name"
              class="text-xs shrink-0"
              :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
            >
              — {{ t.customer_name }}
            </span>
          </div>
        </template>

        <template v-else>
          <div
            v-for="t in testimonials"
            :key="`${pass}-${t.id}`"
            class="shrink-0 w-[280px] rounded-lg border p-4"
            :class="state.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'"
          >
            <div v-if="state.show_ratings && t.rating" class="flex gap-0.5 mb-2">
              <Icon
                v-for="i in 5"
                :key="i"
                icon="heroicons:star-solid"
                class="h-3.5 w-3.5"
                :class="i <= (t.rating ?? 0) ? 'text-amber-400' : 'text-gray-300'"
              />
            </div>
            <p
              class="text-sm leading-relaxed mb-3 line-clamp-3"
              :class="state.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'"
            >
              "{{ t.content ?? 'No content' }}"
            </p>
            <div class="flex items-center gap-2">
              <Avatar v-if="state.show_avatar" class="h-7 w-7">
                <AvatarImage v-if="t.customer_avatar_url" :src="t.customer_avatar_url" />
                <AvatarFallback class="text-xs">{{ getInitials(t.customer_name) }}</AvatarFallback>
              </Avatar>
              <div>
                <p
                  class="text-xs font-medium"
                  :class="state.theme === 'dark' ? 'text-white' : 'text-gray-900'"
                >
                  {{ t.customer_name ?? 'Anonymous' }}
                </p>
                <p
                  v-if="state.show_company && t.customer_company"
                  class="text-xs"
                  :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
                >
                  {{ t.customer_company }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee-preview {
  animation: marquee-scroll 15s linear infinite;
}
.animate-marquee-reverse {
  animation-direction: reverse;
}
</style>
