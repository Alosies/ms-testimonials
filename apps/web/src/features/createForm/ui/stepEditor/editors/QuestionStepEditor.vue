<script setup lang="ts">
import { computed, toRefs } from 'vue';
import {
  Input,
  Textarea,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { FormStep, LinkedQuestion, QuestionOption } from '@/shared/stepCards';
import { useOrganizationStore } from '@/entities/organization';
import QuestionOptionsSection from './childComponents/QuestionOptionsSection.vue';
import RatingScaleSection from './childComponents/RatingScaleSection.vue';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:question', question: Partial<LinkedQuestion>): void;
}>();

// Get allowed question types from organization's plan
const organizationStore = useOrganizationStore();
const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

// Get current question data
const question = computed(() => props.step.question);

// Get current question type details
const currentQuestionType = computed(() =>
  questionTypes.value.find((t) => t.id === question.value?.questionType?.uniqueName)
);

const questionTypeIcon = computed(() => currentQuestionType.value?.icon ?? 'minus');

const supportsOptions = computed(() => {
  const typeName = question.value?.questionType?.uniqueName;
  return typeName === 'choice_single' || typeName === 'choice_multiple';
});

const isRatingScale = computed(() => {
  return question.value?.questionType?.uniqueName === 'rating_scale';
});

// Map icon names to iconify format
function getHeroIconName(iconName: string | null | undefined): string {
  if (!iconName) return 'heroicons:minus';
  if (iconName.includes(':')) return iconName;
  return `heroicons:${iconName}`;
}

// Update a field on the question
function updateField<K extends keyof LinkedQuestion>(field: K, value: LinkedQuestion[K]) {
  if (!question.value) return;
  emit('update:question', { [field]: value });
}

// Update the question type (needs special handling as it's a nested object)
function updateQuestionType(value: unknown) {
  if (!value || typeof value !== 'string') return;
  const typeInfo = questionTypes.value.find((t) => t.id === value);
  if (!typeInfo) return;

  emit('update:question', {
    questionType: {
      id: value,
      uniqueName: value,
      name: typeInfo.name,
      category: 'custom',
      inputComponent: value,
    },
  });
}

// Options management - delegate to child component
function handleAddOption() {
  if (!question.value) return;
  const currentOptions = question.value.options ?? [];
  const newOption: QuestionOption = {
    id: `temp_${Date.now()}`,
    optionValue: `option_${currentOptions.length + 1}`,
    optionLabel: '',
    displayOrder: currentOptions.length + 1,
    isDefault: false,
  };
  emit('update:question', { options: [...currentOptions, newOption] });
}

function handleUpdateOption(index: number, updates: Partial<QuestionOption>) {
  if (!question.value) return;
  const currentOptions = question.value.options ?? [];
  const updatedOptions = currentOptions.map((opt, idx) =>
    idx === index ? { ...opt, ...updates } : opt
  );
  emit('update:question', { options: updatedOptions });
}

function handleRemoveOption(index: number) {
  if (!question.value) return;
  const currentOptions = question.value.options ?? [];
  const updatedOptions = currentOptions
    .filter((_, idx) => idx !== index)
    .map((opt, idx) => ({ ...opt, displayOrder: idx + 1 }));
  emit('update:question', { options: updatedOptions.length > 0 ? updatedOptions : [] });
}
</script>

<template>
  <div v-if="question" class="space-y-6">
    <!-- Question Text -->
    <div>
      <Label class="text-sm font-medium">Question Text</Label>
      <Textarea
        :model-value="question.questionText"
        class="mt-1.5"
        rows="3"
        placeholder="Enter your question..."
        @update:model-value="(v) => updateField('questionText', String(v))"
      />
    </div>

    <!-- Type and Required Row -->
    <div class="flex items-end gap-4">
      <!-- Question Type -->
      <div class="flex-1">
        <Label class="text-sm font-medium">Question Type</Label>
        <Select
          :model-value="question.questionType?.uniqueName"
          @update:model-value="updateQuestionType"
        >
          <SelectTrigger class="mt-1.5">
            <div class="flex items-center gap-2">
              <Icon
                :icon="getHeroIconName(questionTypeIcon)"
                class="h-4 w-4 text-gray-500"
              />
              <SelectValue placeholder="Select type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="type in questionTypes" :key="type.id" :value="type.id">
              <div class="flex items-center gap-2">
                <Icon :icon="getHeroIconName(type.icon)" class="h-4 w-4 text-gray-500" />
                <span>{{ type.name }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Required Toggle -->
      <div class="flex h-9 items-center gap-3 rounded-lg border bg-gray-50 px-4">
        <Label class="text-sm">Required</Label>
        <Switch
          :model-value="question.isRequired"
          @update:model-value="(v) => updateField('isRequired', v)"
        />
      </div>
    </div>

    <!-- Options Section for Choice Questions -->
    <QuestionOptionsSection
      v-if="supportsOptions"
      :options="question.options ?? []"
      :question-type-name="question.questionType?.uniqueName ?? ''"
      @add="handleAddOption"
      @update="handleUpdateOption"
      @remove="handleRemoveOption"
    />

    <!-- Scale Settings for Rating Scale -->
    <RatingScaleSection
      v-if="isRatingScale"
      :min-value="question.minValue ?? null"
      :max-value="question.maxValue ?? null"
      :min-label="question.scaleMinLabel ?? null"
      :max-label="question.scaleMaxLabel ?? null"
      @update:min-value="(v) => updateField('minValue', v)"
      @update:max-value="(v) => updateField('maxValue', v)"
      @update:min-label="(v) => updateField('scaleMinLabel', v)"
      @update:max-label="(v) => updateField('scaleMaxLabel', v)"
    />

    <Separator class="my-4" />

    <!-- Placeholder Text -->
    <div>
      <Label class="text-sm font-medium">Placeholder Text</Label>
      <Input
        :model-value="question.placeholder ?? ''"
        class="mt-1.5"
        placeholder="Hint text shown in the input..."
        @update:model-value="(v) => updateField('placeholder', String(v) || null)"
      />
      <p class="mt-1 text-xs text-gray-500">Displayed as a hint inside the input field</p>
    </div>

    <!-- Help Text -->
    <div>
      <Label class="text-sm font-medium">Help Text</Label>
      <Input
        :model-value="question.helpText ?? ''"
        class="mt-1.5"
        placeholder="Additional guidance for respondents..."
        @update:model-value="(v) => updateField('helpText', String(v) || null)"
      />
      <p class="mt-1 text-xs text-gray-500">Shown below the question to provide context</p>
    </div>
  </div>

  <!-- Empty state when no question is linked -->
  <div v-else class="space-y-4">
    <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <Icon icon="heroicons:question-mark-circle" class="mx-auto h-12 w-12 text-gray-300" />
      <h3 class="mt-4 text-sm font-medium text-gray-900">No question linked</h3>
      <p class="mt-2 text-sm text-gray-500">
        This step doesn't have a question associated with it yet.
      </p>
    </div>
  </div>
</template>
