<script setup lang="ts">
import { computed } from 'vue';
import { Input, Textarea, Label, Switch } from '@testimonials/ui';
import type { FormStep, ThankYouContent } from '../../../models/stepContent';
import { isThankYouStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: ThankYouContent): void;
}>();

const content = computed((): ThankYouContent => {
  if (isThankYouStep(props.step)) {
    return props.step.content;
  }
  return { title: '', message: '', showSocialShare: false };
});

function update(field: keyof ThankYouContent, value: unknown) {
  emit('update', { ...content.value, [field]: value });
}

function updateString(field: keyof ThankYouContent, value: string | number) {
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
        placeholder="Thank you!"
        @update:model-value="updateString('title', $event)"
      />
    </div>

    <div>
      <Label for="message">Message</Label>
      <Textarea
        id="message"
        :model-value="content.message"
        placeholder="Your testimonial has been submitted successfully."
        :rows="3"
        @update:model-value="updateString('message', $event)"
      />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>Enable Social Sharing</Label>
        <p class="text-xs text-muted-foreground">
          Show social share buttons after submission
        </p>
      </div>
      <Switch
        :checked="content.showSocialShare"
        @update:checked="update('showSocialShare', $event)"
      />
    </div>

    <div v-if="content.showSocialShare">
      <Label for="shareMessage">Share Message</Label>
      <Textarea
        id="shareMessage"
        :model-value="content.socialShareMessage ?? ''"
        placeholder="I just left a testimonial for..."
        :rows="2"
        @update:model-value="updateString('socialShareMessage', $event)"
      />
    </div>

    <div>
      <Label for="redirectUrl">Redirect URL (optional)</Label>
      <Input
        id="redirectUrl"
        :model-value="content.redirectUrl ?? ''"
        placeholder="https://yoursite.com"
        @update:model-value="updateString('redirectUrl', $event)"
      />
      <p class="text-xs text-muted-foreground mt-1">
        Redirect to this URL after a few seconds
      </p>
    </div>
  </div>
</template>
