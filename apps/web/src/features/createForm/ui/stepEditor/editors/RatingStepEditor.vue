<script setup lang="ts">
import { Input, Label, Switch } from '@testimonials/ui';
import type { FormStep } from '@/shared/stepCards';

interface Props {
  step: FormStep;
}

defineProps<Props>();

// TODO: Rating steps use form_questions with question_type = 'rating'
// For now, show placeholder UI
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
      Rating configuration will be connected to the form_questions table.
    </p>

    <div>
      <Label>Question</Label>
      <Input
        placeholder="How would you rate your experience?"
        disabled
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <Label>Min Value</Label>
        <Input type="number" value="1" disabled />
      </div>
      <div>
        <Label>Max Value</Label>
        <Input type="number" value="5" disabled />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <Label>Low Label</Label>
        <Input placeholder="Poor" disabled />
      </div>
      <div>
        <Label>High Label</Label>
        <Input placeholder="Excellent" disabled />
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>Required</Label>
        <p class="text-xs text-muted-foreground">Customer must provide a rating</p>
      </div>
      <Switch disabled />
    </div>
  </div>
</template>
