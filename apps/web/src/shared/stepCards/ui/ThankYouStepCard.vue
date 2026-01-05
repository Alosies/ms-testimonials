<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { FormStep, ThankYouContent, StepCardMode } from '../models';
import { isThankYouStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const content = computed((): ThankYouContent | null => {
  if (isThankYouStep(props.step)) {
    return props.step.content;
  }
  return null;
});
</script>

<template>
  <div v-if="content" class="text-center">
    <div
      class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
    >
      <Icon icon="heroicons:check" class="w-8 h-8 text-primary" />
    </div>
    <h3 class="font-medium mb-1">{{ content.title }}</h3>
    <p class="text-sm text-muted-foreground">{{ content.message }}</p>
    <div v-if="content.showSocialShare" class="mt-4 flex justify-center gap-2">
      <Icon icon="simple-icons:x" class="w-5 h-5 text-muted-foreground" />
      <Icon icon="simple-icons:linkedin" class="w-5 h-5 text-muted-foreground" />
    </div>
  </div>
</template>
