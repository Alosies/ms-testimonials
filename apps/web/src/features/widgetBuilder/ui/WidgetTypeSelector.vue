<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import type { WidgetType } from '@/entities/widget';

const modelValue = defineModel<WidgetType>({ required: true });

const types = [
  {
    value: 'wall_of_love' as const,
    label: 'Wall of Love',
    description: 'Masonry grid showcasing multiple testimonials',
    icon: 'heroicons:squares-2x2',
    colorClass: 'bg-violet-100 text-violet-600 border-violet-200',
    selectedClass: 'ring-2 ring-violet-500 border-violet-300',
  },
  {
    value: 'carousel' as const,
    label: 'Carousel',
    description: 'Sliding testimonials with navigation',
    icon: 'heroicons:rectangle-stack',
    colorClass: 'bg-blue-100 text-blue-600 border-blue-200',
    selectedClass: 'ring-2 ring-blue-500 border-blue-300',
  },
  {
    value: 'single_quote' as const,
    label: 'Single Quote',
    description: 'Featured testimonial highlight',
    icon: 'heroicons:chat-bubble-bottom-center-text',
    colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    selectedClass: 'ring-2 ring-emerald-500 border-emerald-300',
  },
];
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-3 block">Widget Type</label>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <button
        v-for="t in types"
        :key="t.value"
        type="button"
        class="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-all hover:shadow-sm"
        :class="[
          modelValue === t.value ? t.selectedClass : 'border-border hover:border-border/80',
        ]"
        @click="modelValue = t.value"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="t.colorClass">
          <Icon :icon="t.icon" class="h-5 w-5" />
        </div>
        <div>
          <p class="text-sm font-medium text-foreground">{{ t.label }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">{{ t.description }}</p>
        </div>
      </button>
    </div>
  </div>
</template>
