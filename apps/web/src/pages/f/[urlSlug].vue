<script setup lang="ts">
/**
 * Public form collection page
 * Route: /f/:urlSlug (where urlSlug follows {name}_{id} pattern per ADR-005)
 *
 * This is the customer-facing page where testimonials are submitted.
 * URL pattern: /f/product-feedback_xK9mP2qR4tYn
 * Resolution: Extract ID from after last underscore, fetch by primary key
 */
import { definePage } from 'unplugin-vue-router/runtime';
import { useRoute, useRouter } from 'vue-router';
import { computed, watchEffect } from 'vue';
import { extractEntityIdFromSlug } from '@/shared/urls';
import {
  useGetForm,
  parseBranchingConfig,
  parseDesignConfig,
  hexToHslCssVar,
} from '@/entities/form';
import { useGetFormSteps } from '@/entities/formStep';
import { PublicFormFlow } from '@/features/publicForm';
import type { FormStep } from '@/shared/stepCards';

definePage({
  meta: {
    public: true,
  },
});

const route = useRoute();
const router = useRouter();

// Extract form ID from URL slug (name_id pattern)
const urlSlug = computed(() => route.params.urlSlug as string);
const extractedInfo = computed(() => extractEntityIdFromSlug(urlSlug.value));
const formId = computed(() => extractedInfo.value?.entityId ?? '');
const isValidUrl = computed(() => extractedInfo.value?.isValid ?? false);

// Reactively redirect to 404 if URL is invalid
watchEffect(() => {
  if (urlSlug.value && !isValidUrl.value) {
    router.replace('/404');
  }
});

// Fetch form data
const formVars = computed(() => ({ formId: formId.value }));
const { form, loading: formLoading } = useGetForm(formVars);

// Fetch form steps
const stepsVars = computed(() => ({ formId: formId.value }));
const { formSteps, loading: stepsLoading } = useGetFormSteps(stepsVars);

// Transform GraphQL form steps to FormStep type
const steps = computed((): FormStep[] => {
  return formSteps.value.map((step) => ({
    id: step.id,
    formId: step.form_id,
    stepType: step.step_type as FormStep['stepType'],
    stepOrder: step.step_order,
    questionId: step.question_id ?? null,
    question: step.question
      ? {
          id: step.question.id,
          questionText: step.question.question_text,
          placeholder: step.question.placeholder ?? null,
          helpText: step.question.help_text ?? null,
          isRequired: step.question.is_required,
          minValue: step.question.min_value ?? null,
          maxValue: step.question.max_value ?? null,
          minLength: step.question.min_length ?? null,
          maxLength: step.question.max_length ?? null,
          scaleMinLabel: step.question.scale_min_label ?? null,
          scaleMaxLabel: step.question.scale_max_label ?? null,
          questionType: {
            id: step.question.question_type.id,
            uniqueName: step.question.question_type.unique_name,
            name: step.question.question_type.name,
            category: step.question.question_type.category,
            inputComponent: step.question.question_type.input_component,
          },
          options:
            step.question.options?.map((opt) => ({
              id: opt.id,
              optionValue: opt.option_value,
              optionLabel: opt.option_label,
              displayOrder: opt.display_order,
              isDefault: opt.is_default,
            })) ?? [],
        }
      : null,
    content: (step.content as FormStep['content']) ?? {},
    tips: (step.tips as string[]) ?? [],
    flowMembership: (step.flow_membership as FormStep['flowMembership']) ?? 'shared',
    isActive: step.is_active,
  }));
});

const isLoading = computed(() => formLoading.value || stepsLoading.value);
const hasSteps = computed(() => steps.value.length > 0);

// Parse branching config from form data
const branchingConfig = computed(() => {
  if (!form.value?.branching_config) return null;
  return parseBranchingConfig(form.value.branching_config);
});

// Parse design config from form data
const designConfig = computed(() => {
  if (!form.value?.settings) return null;
  return parseDesignConfig(form.value.settings);
});

// Get organization logo
const orgLogoUrl = computed(() => form.value?.organization?.logo?.storage_path ?? null);

// Primary color in HSL format for card content
const primaryColorHsl = computed(() => {
  if (!designConfig.value?.primaryColor) return null;
  return hexToHslCssVar(designConfig.value.primaryColor);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <div
          class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"
        />
        <p class="mt-4 text-muted-foreground">Loading form...</p>
      </div>
    </div>

    <!-- Form not found -->
    <div
      v-else-if="!form"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">Form not found</h1>
        <p class="mt-2 text-gray-600">
          This form may have been deleted or the link is incorrect.
        </p>
      </div>
    </div>

    <!-- No steps configured -->
    <div
      v-else-if="!hasSteps"
      class="flex items-center justify-center min-h-screen"
    >
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-gray-900">
          Form not ready yet
        </h1>
        <p class="mt-2 text-gray-600">
          This form hasn't been configured with any steps yet.
        </p>
      </div>
    </div>

    <!-- Public form flow -->
    <PublicFormFlow
      v-else
      :steps="steps"
      :form-name="form.name"
      :branching-config="branchingConfig"
      :logo-url="orgLogoUrl"
      :primary-color-hsl="primaryColorHsl"
    />
  </div>
</template>
