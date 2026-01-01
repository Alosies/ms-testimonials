<script setup lang="ts">
/**
 * QuestionInput - Dynamic component resolver
 *
 * Renders the appropriate input component based on question_type_id.
 * Used in both preview mode (disabled) and live form mode (interactive).
 *
 * Handles type-appropriate default values centrally to ensure child components
 * receive properly typed values even when no v-model is provided (preview mode).
 */
import { computed, type Component } from 'vue';
import type { QuestionInputProps, QuestionAnswerValue, QuestionTypeId } from './models';

// Import all input components
import TextShortInput from './components/TextShortInput.vue';
import TextLongInput from './components/TextLongInput.vue';
import TextEmailInput from './components/TextEmailInput.vue';
import CheckboxInput from './components/CheckboxInput.vue';
import SwitchInput from './components/SwitchInput.vue';
import RatingStarInput from './components/RatingStarInput.vue';
import RatingScaleInput from './components/RatingScaleInput.vue';
import ChoiceSingleInput from './components/ChoiceSingleInput.vue';
import ChoiceMultipleInput from './components/ChoiceMultipleInput.vue';

const props = defineProps<QuestionInputProps>();
const modelValue = defineModel<QuestionAnswerValue>();

/**
 * Map of question type IDs to their corresponding input components
 */
const componentMap: Record<QuestionTypeId, Component> = {
  text_short: TextShortInput,
  text_long: TextLongInput,
  text_email: TextEmailInput,
  rating_star: RatingStarInput,
  rating_scale: RatingScaleInput,
  choice_single: ChoiceSingleInput,
  choice_multiple: ChoiceMultipleInput,
  input_checkbox: CheckboxInput,
  input_switch: SwitchInput,
};

/**
 * Default values by question type - ensures child components receive correct types
 */
function getDefaultValue(typeId: QuestionTypeId): QuestionAnswerValue {
  switch (typeId) {
    case 'text_short':
    case 'text_long':
    case 'text_email':
    case 'choice_single':
      return '';
    case 'choice_multiple':
      return [];
    case 'rating_star':
    case 'rating_scale':
      return null;
    case 'input_checkbox':
    case 'input_switch':
      return false;
    default:
      return '';
  }
}

/**
 * Resolved input component based on question type
 */
const inputComponent = computed(() => {
  const typeId = props.question_type_id as QuestionTypeId;
  return componentMap[typeId] ?? TextShortInput;
});

/**
 * Check if value type matches expected type for the question type
 */
function isValidValueType(value: QuestionAnswerValue, typeId: QuestionTypeId): boolean {
  if (value === undefined || value === null) return false;

  switch (typeId) {
    case 'text_short':
    case 'text_long':
    case 'text_email':
    case 'choice_single':
      return typeof value === 'string';
    case 'choice_multiple':
      return Array.isArray(value);
    case 'rating_star':
    case 'rating_scale':
      return typeof value === 'number';
    case 'input_checkbox':
    case 'input_switch':
      return typeof value === 'boolean';
    default:
      return typeof value === 'string';
  }
}

/**
 * Normalized value with type-appropriate default
 * Writable computed to maintain two-way binding
 */
const normalizedValue = computed({
  get: () => {
    const typeId = props.question_type_id as QuestionTypeId;
    const defaultVal = getDefaultValue(typeId);
    const currentValue = modelValue.value;

    // Only use current value if it matches the expected type
    if (isValidValueType(currentValue, typeId)) {
      return currentValue;
    }

    return defaultVal;
  },
  set: (v: QuestionAnswerValue) => {
    modelValue.value = v;
  },
});
</script>

<template>
  <component
    :is="inputComponent"
    v-model="normalizedValue"
    :question-id="questionId"
    :placeholder="placeholder"
    :disabled="disabled"
    :is_required="is_required"
    :options="options"
    :min_value="min_value"
    :max_value="max_value"
    :scale-min-label="scaleMinLabel"
    :scale-max-label="scaleMaxLabel"
  />
</template>
