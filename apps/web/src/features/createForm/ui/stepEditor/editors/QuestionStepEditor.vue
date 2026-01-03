<script setup lang="ts">
import { Textarea, Label, Switch } from '@testimonials/ui';
import type { FormStep } from '../../../models/stepContent';

interface Props {
  step: FormStep;
}

defineProps<Props>();

// TODO: This will edit form_questions data via a separate mutation
// For now, show placeholder UI
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
      Question editing will be connected to the form_questions table.
    </p>

    <div>
      <Label>Question Text</Label>
      <Textarea
        placeholder="What problem were you trying to solve?"
        :rows="3"
        disabled
      />
    </div>

    <div>
      <Label>Placeholder Text</Label>
      <Textarea
        placeholder="Tell us about your experience..."
        :rows="2"
        disabled
      />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>Required</Label>
        <p class="text-xs text-muted-foreground">Customer must answer this question</p>
      </div>
      <Switch disabled />
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>Allow Video Response</Label>
        <p class="text-xs text-muted-foreground">Let customers record video answers</p>
      </div>
      <Switch disabled />
    </div>
  </div>
</template>
