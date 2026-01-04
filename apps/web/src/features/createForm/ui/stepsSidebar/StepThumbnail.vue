<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep } from '@/shared/stepCards';
import { getStepLabel, getStepIcon } from '../../functions';

interface Props {
  step: FormStep;
  index: number;
  isSelected: boolean;
  isModified?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'select'): void;
}>();

const label = computed(() => getStepLabel(props.step));
const icon = computed(() => getStepIcon(props.step.stepType));
const stepNumber = computed(() => props.index + 1);
</script>

<template>
  <button
    class="relative flex flex-col items-center justify-center w-14 h-14 mx-auto rounded-lg border transition-all"
    :class="{
      'border-primary bg-primary/5 ring-2 ring-primary': isSelected,
      'border-border bg-background hover:border-primary/50 hover:bg-muted/50': !isSelected,
    }"
    @click="emit('select')"
  >
    <!-- Step number badge -->
    <span
      class="absolute -top-1 -left-1 w-5 h-5 rounded-full text-xs font-medium flex items-center justify-center"
      :class="{
        'bg-primary text-primary-foreground': isSelected,
        'bg-muted text-muted-foreground': !isSelected,
      }"
    >
      {{ stepNumber }}
    </span>

    <!-- Icon -->
    <Icon :icon="icon" class="w-5 h-5 mb-0.5" />

    <!-- Label -->
    <span class="text-[10px] font-medium text-muted-foreground truncate max-w-full px-1">
      {{ label }}
    </span>

    <!-- Modified indicator -->
    <span
      v-if="isModified"
      class="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500"
    />
  </button>
</template>
