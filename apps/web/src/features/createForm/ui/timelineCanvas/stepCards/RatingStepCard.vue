<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
  minValue?: number;
  maxValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  minValue: 1,
  maxValue: 5,
});

const displayText = computed(() =>
  props.step.question?.questionText || 'How would you rate your experience?'
);
</script>

<template>
  <div class="text-center">
    <p class="font-medium mb-4">
      {{ displayText }}
    </p>
    <div class="flex justify-center gap-2">
      <div
        v-for="n in (props.maxValue - props.minValue + 1)"
        :key="n"
        class="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted cursor-pointer"
      >
        <Icon icon="heroicons:star" class="w-5 h-5 text-muted-foreground" />
      </div>
    </div>
  </div>
</template>
