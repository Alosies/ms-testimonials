<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import type { WidgetType } from '@/entities/widget';
import { widgetsTestIds } from '@/shared/constants/testIds';

const modelValue = defineModel<WidgetType>({ required: true });

interface TypeOption {
  value: WidgetType;
  label: string;
  description: string;
  icon: string;
  colorClass: string;
  selectedClass: string;
}

interface TypeCategory {
  label: string;
  description: string;
  types: TypeOption[];
}

const categories: TypeCategory[] = [
  {
    label: 'Section Widgets',
    description: 'Full-width components for dedicated testimonial sections',
    types: [
      {
        value: 'wall_of_love',
        label: 'Wall of Love',
        description: 'Masonry grid showcasing multiple testimonials',
        icon: 'heroicons:squares-2x2',
        colorClass: 'bg-violet-100 text-violet-600 border-violet-200',
        selectedClass: 'ring-2 ring-violet-500 border-violet-300',
      },
      {
        value: 'carousel',
        label: 'Carousel',
        description: 'Sliding testimonials with navigation',
        icon: 'heroicons:rectangle-stack',
        colorClass: 'bg-blue-100 text-blue-600 border-blue-200',
        selectedClass: 'ring-2 ring-blue-500 border-blue-300',
      },
      {
        value: 'single_quote',
        label: 'Single Quote',
        description: 'Featured testimonial highlight',
        icon: 'heroicons:chat-bubble-bottom-center-text',
        colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200',
        selectedClass: 'ring-2 ring-emerald-500 border-emerald-300',
      },
    ],
  },
  {
    label: 'Micro Widgets',
    description: 'Compact elements to embed anywhere on your page',
    types: [
      {
        value: 'marquee',
        label: 'Marquee Strip',
        description: 'Auto-scrolling horizontal testimonial strip',
        icon: 'heroicons:arrows-right-left',
        colorClass: 'bg-amber-100 text-amber-600 border-amber-200',
        selectedClass: 'ring-2 ring-amber-500 border-amber-300',
      },
      {
        value: 'rating_badge',
        label: 'Rating Badge',
        description: 'Compact star rating with review count',
        icon: 'heroicons:star',
        colorClass: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        selectedClass: 'ring-2 ring-yellow-500 border-yellow-300',
      },
      {
        value: 'avatars_bar',
        label: 'Avatars Bar',
        description: 'Overlapping customer photos with trust label',
        icon: 'heroicons:user-group',
        colorClass: 'bg-pink-100 text-pink-600 border-pink-200',
        selectedClass: 'ring-2 ring-pink-500 border-pink-300',
      },
    ],
  },
  {
    label: 'Ambient Widgets',
    description: 'Background social proof that appears automatically',
    types: [
      {
        value: 'toast_popup',
        label: 'Toast Popup',
        description: 'Floating notification showing testimonials',
        icon: 'heroicons:bell-alert',
        colorClass: 'bg-indigo-100 text-indigo-600 border-indigo-200',
        selectedClass: 'ring-2 ring-indigo-500 border-indigo-300',
      },
    ],
  },
];
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-3 block">Widget Type</label>
    <div class="space-y-5" :data-testid="widgetsTestIds.typeSelector">
      <div v-for="category in categories" :key="category.label">
        <div class="mb-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {{ category.label }}
          </p>
          <p class="text-xs text-muted-foreground/70">{{ category.description }}</p>
        </div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            v-for="t in category.types"
            :key="t.value"
            type="button"
            :data-testid="widgetsTestIds.typeOption"
            :data-widget-type="t.value"
            class="flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:shadow-sm"
            :class="[
              modelValue === t.value ? t.selectedClass : 'border-border hover:border-border/80',
            ]"
            @click="modelValue = t.value"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-lg" :class="t.colorClass">
              <Icon :icon="t.icon" class="h-4 w-4" />
            </div>
            <div>
              <p class="text-sm font-medium text-foreground">{{ t.label }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ t.description }}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
