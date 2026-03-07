<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@testimonials/ui';
import type { WidgetFormState, TestimonialForSelector } from '../../models';
import type { AvatarsBarSettings } from '@/entities/widget';

const props = defineProps<{
  testimonials: TestimonialForSelector[];
  state: WidgetFormState;
}>();

const settings = computed(() => props.state.settings as AvatarsBarSettings);

const displayed = computed(() =>
  props.testimonials.slice(0, settings.value.max_avatars),
);

const overflowCount = computed(() =>
  Math.max(0, props.testimonials.length - settings.value.max_avatars),
);

const avgRating = computed(() => {
  const ratings = props.testimonials
    .map((t) => t.rating)
    .filter((r): r is number => r !== null);
  if (ratings.length === 0) return null;
  return Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10;
});

const labelText = computed(() =>
  settings.value.label_template.replace('{count}', String(props.testimonials.length)),
);

const sizeClass = computed(() => {
  const map = { small: 'h-8 w-8', medium: 'h-10 w-10', large: 'h-12 w-12' } as const;
  return map[settings.value.size] ?? map.medium;
});

const overlapStyle = computed(() => `-${settings.value.overlap_px}px`);

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}
</script>

<template>
  <div class="flex flex-col items-center gap-2 p-6">
    <div class="flex items-center">
      <Avatar
        v-for="(t, i) in displayed"
        :key="t.id"
        :class="sizeClass"
        class="border-2 shrink-0"
        :style="i > 0 ? { marginLeft: overlapStyle } : {}"
      >
        <AvatarImage v-if="t.customer_avatar_url" :src="t.customer_avatar_url" />
        <AvatarFallback class="text-xs">{{ getInitials(t.customer_name) }}</AvatarFallback>
      </Avatar>

      <div
        v-if="overflowCount > 0"
        :class="sizeClass"
        class="rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-semibold"
        :style="{ marginLeft: overlapStyle }"
      >
        +{{ overflowCount }}
      </div>
    </div>

    <div v-if="settings.show_rating && avgRating !== null" class="flex items-center gap-1">
      <Icon
        v-for="i in 5"
        :key="i"
        icon="heroicons:star-solid"
        class="h-3.5 w-3.5"
        :class="i <= Math.round(avgRating) ? 'text-amber-400' : 'text-gray-300'"
      />
      <span
        class="text-sm font-semibold"
        :class="state.theme === 'dark' ? 'text-white' : 'text-gray-900'"
      >
        {{ avgRating }}
      </span>
    </div>

    <p
      class="text-sm text-center"
      :class="state.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'"
    >
      {{ labelText }}
    </p>
  </div>
</template>
