<script setup lang="ts">
/**
 * Contact Info Input Card — Interactive form for collecting submitter details.
 *
 * Reads enabledFields/requiredFields from step content and renders
 * text/email inputs. Used in the public form flow (not the editor).
 *
 * ADR-025: Phase 5b — Form Submission Persistence
 */
import { computed } from 'vue';
import type { FormStep, ContactInfoContent, ContactField, StepCardMode } from '../models';
import { isContactInfoStep } from '../functions';

interface Props {
  step: FormStep;
  mode?: StepCardMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
});

const modelValue = defineModel<Record<string, string>>({ default: () => ({}) });

const content = computed((): ContactInfoContent | null => {
  if (isContactInfoStep(props.step)) {
    return props.step.content;
  }
  return null;
});

/** Fields to display (excluding 'photo' for MVP) */
const displayFields = computed(() => {
  if (!content.value) return [];
  return content.value.enabledFields.filter((f) => f !== 'photo');
});

const fieldConfig: Record<string, { label: string; type: string; placeholder: string }> = {
  name: { label: 'Full Name', type: 'text', placeholder: 'Jane Smith' },
  email: { label: 'Email', type: 'email', placeholder: 'jane@example.com' },
  jobTitle: { label: 'Job Title', type: 'text', placeholder: 'Product Manager' },
  company: { label: 'Company', type: 'text', placeholder: 'Acme Inc.' },
  website: { label: 'Website', type: 'url', placeholder: 'https://example.com' },
  linkedin: { label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/in/...' },
  twitter: { label: 'Twitter / X', type: 'url', placeholder: 'https://x.com/...' },
};

function isRequired(field: ContactField): boolean {
  return content.value?.requiredFields.includes(field) ?? false;
}

function updateField(field: string, value: string) {
  modelValue.value = { ...modelValue.value, [field]: value };
}
</script>

<template>
  <div v-if="content" class="text-center w-full">
    <h3 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
      {{ content.title }}
    </h3>
    <p v-if="content.subtitle" class="text-base text-gray-500 mb-8 max-w-lg mx-auto">
      {{ content.subtitle }}
    </p>

    <div class="w-full max-w-md mx-auto space-y-4">
      <div v-for="field in displayFields" :key="field">
        <label class="block text-sm font-medium text-gray-700 text-left mb-1">
          {{ fieldConfig[field]?.label ?? field }}
          <span v-if="isRequired(field)" class="text-destructive">*</span>
        </label>
        <input
          :type="fieldConfig[field]?.type ?? 'text'"
          :placeholder="fieldConfig[field]?.placeholder ?? ''"
          :required="isRequired(field)"
          :value="modelValue[field] ?? ''"
          class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          @input="updateField(field, ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </div>
</template>
