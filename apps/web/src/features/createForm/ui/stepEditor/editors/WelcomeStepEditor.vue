<script setup lang="ts">
import { computed } from 'vue';
import { Input, Textarea, Label } from '@testimonials/ui';
import type { FormStep, WelcomeContent } from '@/shared/stepCards';
import { isWelcomeStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: WelcomeContent): void;
}>();

const content = computed((): WelcomeContent => {
  if (isWelcomeStep(props.step)) {
    return props.step.content;
  }
  return { title: '', subtitle: '', buttonText: 'Get Started' };
});

function update(field: keyof WelcomeContent, value: string | number) {
  emit('update', { ...content.value, [field]: String(value) });
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="Share your experience"
        @update:model-value="update('title', $event)"
      />
    </div>

    <div>
      <Label for="subtitle">Subtitle</Label>
      <Textarea
        id="subtitle"
        :model-value="content.subtitle"
        placeholder="Your feedback helps others make better decisions."
        :rows="3"
        @update:model-value="update('subtitle', $event)"
      />
    </div>

    <div>
      <Label for="buttonText">Button Text</Label>
      <Input
        id="buttonText"
        :model-value="content.buttonText"
        placeholder="Get Started"
        @update:model-value="update('buttonText', $event)"
      />
    </div>
  </div>
</template>
