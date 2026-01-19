<script setup lang="ts">
import { ref } from 'vue';
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
import type { QuestionTypeId, AIQuestionOption } from '@/shared/api';
import type { QuestionData } from '../../../models';
import QuestionOptionsEditor from './QuestionOptionsEditor.vue';

interface QuestionTypeOption {
  uniqueName: string; // Used as Select value and for comparison (e.g., 'text_short')
  id: string; // Actual database ID for mutations
  name: string;
  icon: string | null | undefined;
  supportsOptions?: boolean;
}

defineProps<{
  question: QuestionData;
  questionTypes: QuestionTypeOption[];
  questionTypeIcon: string;
  supportsOptions: boolean;
  isRequired: boolean;
}>();

const emit = defineEmits<{
  'update:isRequired': [value: boolean];
  updateField: [field: keyof QuestionData, value: QuestionData[keyof QuestionData]];
  addOption: [];
  updateOption: [index: number, updates: Partial<AIQuestionOption>];
  removeOption: [index: number];
}>();

// Template ref for auto-focus
const questionTextRef = ref<InstanceType<typeof Textarea> | null>(null);

// Expose focus method to parent
function focusQuestionText() {
  questionTextRef.value?.$el?.focus();
}

defineExpose({ focusQuestionText });

// Map icon names to iconify format
function getHeroIconName(iconName: string | null | undefined): string {
  if (!iconName) return 'heroicons:minus';
  if (iconName.includes(':')) return iconName;
  return `heroicons:${iconName}`;
}
</script>

<template>
  <div class="bg-white">
    <!-- Section Header -->
    <div class="border-b bg-white px-6 py-4">
      <div class="flex items-center gap-2">
        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
          <Icon icon="lucide:settings-2" class="h-3.5 w-3.5 text-gray-600" />
        </div>
        <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Question Settings
        </span>
      </div>
    </div>

    <div class="space-y-6 p-6">
      <!-- Question Text -->
      <div>
        <Label class="text-sm font-medium">Question Text</Label>
        <Textarea
          ref="questionTextRef"
          :model-value="question.question_text"
          class="mt-1.5"
          rows="3"
          placeholder="Enter your question..."
          @update:model-value="(v) => emit('updateField', 'question_text', String(v))"
        />
      </div>

      <!-- Type and Required Row -->
      <div class="flex items-end gap-4">
        <!-- Question Type -->
        <div class="flex-1">
          <Label class="text-sm font-medium">Question Type</Label>
          <Select
            :model-value="question.question_type_id"
            @update:model-value="(v) => emit('updateField', 'question_type_id', v as QuestionTypeId)"
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
              <SelectItem v-for="type in questionTypes" :key="type.id" :value="type.uniqueName">
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
            :model-value="isRequired"
            @update:model-value="(v) => emit('update:isRequired', v)"
          />
        </div>
      </div>

      <!-- Options Section for Choice Questions -->
      <QuestionOptionsEditor
        v-if="supportsOptions"
        :options="question.options"
        :question-type-id="question.question_type_id"
        @add="emit('addOption')"
        @update="(idx, updates) => emit('updateOption', idx, updates)"
        @remove="(idx) => emit('removeOption', idx)"
      />

      <!-- Scale Settings for Linear Scale -->
      <div
        v-if="question.question_type_id === 'rating_scale'"
        class="space-y-4 rounded-lg border bg-gray-50 p-4"
      >
        <div class="flex items-center gap-2">
          <Icon icon="lucide:sliders-horizontal" class="h-4 w-4 text-gray-500" />
          <Label class="text-sm font-medium">Scale Settings</Label>
        </div>

        <!-- Scale Range -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-xs text-gray-500">Start Value</Label>
            <Select
              :model-value="String(question.min_value ?? 1)"
              @update:model-value="(v) => emit('updateField', 'min_value', Number(v))"
            >
              <SelectTrigger class="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label class="text-xs text-gray-500">End Value</Label>
            <Select
              :model-value="String(question.max_value ?? 10)"
              @update:model-value="(v) => emit('updateField', 'max_value', Number(v))"
            >
              <SelectTrigger class="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Scale Labels -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label class="text-xs text-gray-500">Min Label</Label>
            <Input
              :model-value="question.scale_min_label ?? ''"
              class="mt-1"
              placeholder="Low"
              @update:model-value="(v) => emit('updateField', 'scale_min_label', String(v) || null)"
            />
          </div>
          <div>
            <Label class="text-xs text-gray-500">Max Label</Label>
            <Input
              :model-value="question.scale_max_label ?? ''"
              class="mt-1"
              placeholder="High"
              @update:model-value="(v) => emit('updateField', 'scale_max_label', String(v) || null)"
            />
          </div>
        </div>
        <p class="text-xs text-gray-500">
          Customize the scale range and endpoint labels
        </p>
      </div>

      <Separator class="my-4" />

      <!-- Placeholder Text -->
      <div>
        <Label class="text-sm font-medium">Placeholder Text</Label>
        <Input
          :model-value="question.placeholder ?? ''"
          class="mt-1.5"
          placeholder="Hint text shown in the input..."
          @update:model-value="(v) => emit('updateField', 'placeholder', String(v) || null)"
        />
        <p class="mt-1 text-xs text-gray-500">Displayed as a hint inside the input field</p>
      </div>

      <!-- Help Text -->
      <div>
        <Label class="text-sm font-medium">Help Text</Label>
        <Input
          :model-value="question.help_text ?? ''"
          class="mt-1.5"
          placeholder="Additional guidance for respondents..."
          @update:model-value="(v) => emit('updateField', 'help_text', String(v) || null)"
        />
        <p class="mt-1 text-xs text-gray-500">Shown below the question to provide context</p>
      </div>
    </div>
  </div>
</template>
