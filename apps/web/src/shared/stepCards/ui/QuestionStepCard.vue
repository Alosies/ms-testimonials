<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, StepCardMode } from '../models';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
  questionText?: string;
  questionType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const displayText = computed(() =>
  props.questionText || (props.mode === 'edit' ? 'Question text...' : ''),
);
const displayType = computed(() => props.questionType || 'text');

const typeIcon = computed(() => {
  switch (displayType.value) {
    case 'rating':
      return 'heroicons:star';
    case 'video':
      return 'heroicons:video-camera';
    default:
      return 'heroicons:chat-bubble-left-right';
  }
});
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <div
        class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"
      >
        <Icon :icon="typeIcon" class="w-5 h-5 text-primary" />
      </div>
      <div class="flex-1">
        <p class="font-medium">{{ displayText }}</p>
        <p class="text-sm text-muted-foreground mt-1">
          {{ displayType }} response
        </p>
      </div>
    </div>

    <!-- Tips preview -->
    <div v-if="step.tips.length > 0" class="mt-4 pl-13">
      <div class="text-xs font-medium text-muted-foreground mb-1">Tips:</div>
      <ul class="text-sm text-muted-foreground space-y-1">
        <li
          v-for="(tip, i) in step.tips.slice(0, 2)"
          :key="i"
          class="flex items-start gap-2"
        >
          <Icon
            icon="heroicons:light-bulb"
            class="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
          />
          <span>{{ tip }}</span>
        </li>
        <li v-if="step.tips.length > 2" class="text-xs">
          +{{ step.tips.length - 2 }} more
        </li>
      </ul>
    </div>
  </div>
</template>
