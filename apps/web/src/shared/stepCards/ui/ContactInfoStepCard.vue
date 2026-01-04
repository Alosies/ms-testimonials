<script setup lang="ts">
import { computed } from 'vue';
import type { FormStep, ContactInfoContent, StepCardMode } from '../models';
import { isContactInfoStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const content = computed((): ContactInfoContent | null => {
  if (isContactInfoStep(props.step)) {
    return props.step.content;
  }
  return null;
});

const fieldLabels: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  photo: 'Photo',
  jobTitle: 'Job Title',
  company: 'Company',
  website: 'Website',
  linkedin: 'LinkedIn',
  twitter: 'Twitter/X',
};
</script>

<template>
  <div v-if="content">
    <h3 class="font-medium mb-2">{{ content.title }}</h3>
    <p v-if="content.subtitle" class="text-sm text-muted-foreground mb-4">
      {{ content.subtitle }}
    </p>
    <div class="space-y-2">
      <div
        v-for="field in content.enabledFields"
        :key="field"
        class="flex items-center gap-2"
      >
        <div class="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <span class="text-sm">
          {{ fieldLabels[field] }}
          <span
            v-if="content.requiredFields.includes(field)"
            class="text-destructive"
            >*</span
          >
        </span>
      </div>
    </div>
  </div>
</template>
