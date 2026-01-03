<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@testimonials/ui';
import type { FormStep, WelcomeContent } from '../../../models/stepContent';
import { isWelcomeStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const content = computed((): WelcomeContent => {
  if (isWelcomeStep(props.step)) {
    return props.step.content;
  }
  return { title: '', subtitle: '', buttonText: 'Get Started' };
});
</script>

<template>
  <div class="text-center">
    <h2 class="text-xl font-semibold mb-2">
      {{ content.title || 'Welcome' }}
    </h2>
    <p class="text-muted-foreground mb-4">
      {{ content.subtitle || 'Add a subtitle...' }}
    </p>
    <Button>
      {{ content.buttonText || 'Get Started' }}
    </Button>
  </div>
</template>
