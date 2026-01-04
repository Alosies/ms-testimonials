<script setup lang="ts">
import { computed } from 'vue';
import { Input, Label, Switch, Textarea } from '@testimonials/ui';
import type { FormStep, ContactInfoContent, ContactField } from '@/shared/stepCards';
import { isContactInfoStep } from '../../../functions';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update', content: ContactInfoContent): void;
}>();

const content = computed((): ContactInfoContent => {
  if (isContactInfoStep(props.step)) {
    return props.step.content;
  }
  return { title: '', enabledFields: ['email'], requiredFields: ['email'] };
});

const allFields: { key: ContactField; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'photo', label: 'Photo' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'company', label: 'Company' },
  { key: 'website', label: 'Website' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter/X' },
];

function toggleField(field: ContactField) {
  const enabled = content.value.enabledFields.includes(field);
  let newEnabled: ContactField[];
  let newRequired = [...content.value.requiredFields];

  if (enabled) {
    newEnabled = content.value.enabledFields.filter(f => f !== field);
    newRequired = newRequired.filter(f => f !== field);
  } else {
    newEnabled = [...content.value.enabledFields, field];
  }

  emit('update', {
    ...content.value,
    enabledFields: newEnabled,
    requiredFields: newRequired,
  });
}

function toggleRequired(field: ContactField) {
  const required = content.value.requiredFields.includes(field);
  const newRequired = required
    ? content.value.requiredFields.filter(f => f !== field)
    : [...content.value.requiredFields, field];

  emit('update', { ...content.value, requiredFields: newRequired });
}

function updateTitle(value: string | number) {
  emit('update', { ...content.value, title: String(value) });
}

function updateSubtitle(value: string | number) {
  emit('update', { ...content.value, subtitle: String(value) });
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <Label for="title">Title</Label>
      <Input
        id="title"
        :model-value="content.title"
        placeholder="About You"
        @update:model-value="updateTitle"
      />
    </div>

    <div>
      <Label for="subtitle">Subtitle</Label>
      <Textarea
        id="subtitle"
        :model-value="content.subtitle ?? ''"
        placeholder="Tell us a bit about yourself"
        :rows="2"
        @update:model-value="updateSubtitle"
      />
    </div>

    <div>
      <Label class="mb-3 block">Fields to collect</Label>
      <div class="space-y-3">
        <div
          v-for="field in allFields"
          :key="field.key"
          class="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div class="flex items-center gap-3">
            <Switch
              :checked="content.enabledFields.includes(field.key)"
              @update:checked="toggleField(field.key)"
            />
            <span class="text-sm">{{ field.label }}</span>
          </div>
          <div
            v-if="content.enabledFields.includes(field.key)"
            class="flex items-center gap-2"
          >
            <span class="text-xs text-muted-foreground">Required</span>
            <Switch
              :checked="content.requiredFields.includes(field.key)"
              @update:checked="toggleRequired(field.key)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
