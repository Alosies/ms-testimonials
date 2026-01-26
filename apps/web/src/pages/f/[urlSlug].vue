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
import { useGetFormSteps, parseStepContentWithDefaults } from '@/entities/formStep';
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
/**
 * Derive flow membership from the flow relationship.
 * ADR-009: Flow identity is determined by flow_type + branch_operator, not a separate column.
 */
function deriveFlowMembership(flow: { flow_type: string; branch_operator?: string | null }): FormStep['flowMembership'] {
  if (flow.flow_type === 'shared') {
    return 'shared';
  }
  if (flow.branch_operator === 'greater_than_or_equal_to') {
    return 'testimonial';
  }
  if (flow.branch_operator === 'less_than') {
    return 'improvement';
  }
  return 'shared';
}

// ADR-013: Access question via questions[0] array relationship
const steps = computed((): FormStep[] => {
  return formSteps.value.map((step) => {
    // ADR-013: Get first question from array relationship
    const question = step.questions?.[0];
    return {
      id: step.id,
      // ADR-013: flowId is required, formId removed
      flowId: step.flow_id,
      stepType: step.step_type as FormStep['stepType'],
      stepOrder: step.step_order,
      // ADR-013: Transform question from array or null
      question: question
        ? {
            id: question.id,
            questionText: question.question_text,
            placeholder: question.placeholder ?? null,
            helpText: question.help_text ?? null,
            isRequired: question.is_required,
            minValue: question.min_value ?? null,
            maxValue: question.max_value ?? null,
            minLength: question.min_length ?? null,
            maxLength: question.max_length ?? null,
            scaleMinLabel: question.scale_min_label ?? null,
            scaleMaxLabel: question.scale_max_label ?? null,
            questionType: {
              id: question.question_type.id,
              uniqueName: question.question_type.unique_name,
              name: question.question_type.name,
              category: question.question_type.category,
              inputComponent: question.question_type.input_component,
            },
            options:
              question.options?.map((opt: { id: string; option_value: string; option_label: string; display_order: number; is_default: boolean }) => ({
                id: opt.id,
                optionValue: opt.option_value,
                optionLabel: opt.option_label,
                displayOrder: opt.display_order,
                isDefault: opt.is_default,
              })) ?? [],
          }
        : null,
      content: parseStepContentWithDefaults(
        step.step_type as FormStep['stepType'],
        step.content,
      ) as FormStep['content'],
      tips: (step.tips as string[]) ?? [],
      // ADR-009: Derived from flow relationship (not deprecated flow_membership column)
      flowMembership: deriveFlowMembership(step.flow),
      isActive: step.is_active,
    };
  });
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

// Get organization ID for analytics
const organizationId = computed(() => form.value?.organization?.id ?? '');

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
      :form-id="formId"
      :organization-id="organizationId"
    />
  </div>
</template>
