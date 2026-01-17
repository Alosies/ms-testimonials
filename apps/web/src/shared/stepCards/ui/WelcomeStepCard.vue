<script setup lang="ts">
import { computed } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStep, WelcomeContent, StepCardMode } from '../models';
import { isWelcomeStep } from '../functions';
import { studioTestIds } from '@/shared/constants/testIds';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const emit = defineEmits<{
  (e: 'start'): void;
}>();

const content = computed((): WelcomeContent => {
  if (isWelcomeStep(props.step)) {
    return props.step.content;
  }
  return { title: '', subtitle: '', buttonText: 'Get Started' };
});

// In edit mode, show placeholder text; in preview, show actual content
const displayTitle = computed(() =>
  content.value.title || (props.mode === 'edit' ? 'Welcome' : ''),
);
const displaySubtitle = computed(() =>
  content.value.subtitle || (props.mode === 'edit' ? 'Add a subtitle...' : ''),
);

const isPreviewMode = computed(() => props.mode === 'preview');

function handleStart() {
  if (isPreviewMode.value) {
    emit('start');
  }
}
</script>

<template>
  <div class="text-center py-8">
    <!-- Welcome icon/graphic -->
    <div
      v-if="isPreviewMode"
      class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
    >
      <Icon icon="heroicons:chat-bubble-left-right" class="w-8 h-8 text-primary" />
    </div>

    <h2
      class="font-semibold mb-3"
      :class="isPreviewMode ? 'text-2xl md:text-3xl' : 'text-xl'"
      :data-testid="studioTestIds.welcomeTitle"
    >
      {{ displayTitle }}
    </h2>
    <p
      class="text-muted-foreground mb-6"
      :class="isPreviewMode ? 'text-lg' : 'text-base'"
      :data-testid="studioTestIds.welcomeSubtitle"
    >
      {{ displaySubtitle }}
    </p>
    <Button
      :size="isPreviewMode ? 'lg' : 'default'"
      :data-testid="studioTestIds.welcomeButton"
      @click="handleStart"
    >
      {{ content.buttonText || 'Get Started' }}
      <Icon
        v-if="isPreviewMode"
        icon="heroicons:arrow-right"
        class="w-4 h-4 ml-2"
      />
    </Button>
  </div>
</template>
