<script setup lang="ts">
import { computed } from 'vue';
import type { FormStep, ConsentContent, StepCardMode } from '../models';
import { isConsentStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const content = computed((): ConsentContent | null => {
  if (isConsentStep(props.step)) {
    return props.step.content;
  }
  return null;
});
</script>

<template>
  <div v-if="content">
    <h3 class="font-medium mb-2">{{ content.title }}</h3>
    <p class="text-sm text-muted-foreground mb-4">{{ content.description }}</p>
    <div class="space-y-2">
      <label
        class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
      >
        <div class="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
        <div>
          <div class="font-medium text-sm">
            {{ content.options.public.label }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ content.options.public.description }}
          </div>
        </div>
      </label>
      <label
        class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
      >
        <div class="w-4 h-4 rounded-full border-2" />
        <div>
          <div class="font-medium text-sm">
            {{ content.options.private.label }}
          </div>
          <div class="text-xs text-muted-foreground">
            {{ content.options.private.description }}
          </div>
        </div>
      </label>
    </div>
  </div>
</template>
