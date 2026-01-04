<script setup lang="ts">
import { computed } from 'vue';
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
import type { FormStep, LinkedQuestion } from '@/shared/stepCards';

interface Props {
  step: FormStep;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:question', question: Partial<LinkedQuestion>): void;
}>();

// Get current question data
const question = computed(() => props.step.question);

// Update a field on the question
function updateField<K extends keyof LinkedQuestion>(field: K, value: LinkedQuestion[K]) {
  if (!question.value) return;
  emit('update:question', { [field]: value });
}
</script>

<template>
  <div v-if="question" class="space-y-6">
    <!-- Question Text -->
    <div>
      <Label class="text-sm font-medium">Rating Question</Label>
      <Textarea
        :model-value="question.questionText"
        class="mt-1.5"
        rows="2"
        placeholder="How would you rate your experience?"
        @update:model-value="(v) => updateField('questionText', String(v))"
      />
    </div>

    <!-- Scale Settings -->
    <div class="space-y-4 rounded-lg border bg-gray-50 p-4">
      <div class="flex items-center gap-2">
        <Icon icon="lucide:star" class="h-4 w-4 text-gray-500" />
        <Label class="text-sm font-medium">Rating Scale</Label>
      </div>

      <!-- Scale Range -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label class="text-xs text-gray-500">Start Value</Label>
          <Select
            :model-value="String(question.minValue ?? 1)"
            @update:model-value="(v) => updateField('minValue', Number(v))"
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
            :model-value="String(question.maxValue ?? 5)"
            @update:model-value="(v) => updateField('maxValue', Number(v))"
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
          <Label class="text-xs text-gray-500">Low Label</Label>
          <Input
            :model-value="question.scaleMinLabel ?? ''"
            class="mt-1"
            placeholder="Poor"
            @update:model-value="(v) => updateField('scaleMinLabel', String(v) || null)"
          />
        </div>
        <div>
          <Label class="text-xs text-gray-500">High Label</Label>
          <Input
            :model-value="question.scaleMaxLabel ?? ''"
            class="mt-1"
            placeholder="Excellent"
            @update:model-value="(v) => updateField('scaleMaxLabel', String(v) || null)"
          />
        </div>
      </div>
      <p class="text-xs text-gray-500">
        Labels help respondents understand what each end of the scale means
      </p>
    </div>

    <!-- Required Toggle -->
    <div class="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
      <div>
        <Label class="text-sm font-medium">Required</Label>
        <p class="text-xs text-gray-500">Respondent must provide a rating</p>
      </div>
      <Switch
        :model-value="question.isRequired"
        @update:model-value="(v) => updateField('isRequired', v)"
      />
    </div>

    <Separator class="my-4" />

    <!-- Help Text -->
    <div>
      <Label class="text-sm font-medium">Help Text</Label>
      <Input
        :model-value="question.helpText ?? ''"
        class="mt-1.5"
        placeholder="Additional guidance for respondents..."
        @update:model-value="(v) => updateField('helpText', String(v) || null)"
      />
      <p class="mt-1 text-xs text-gray-500">Shown below the rating to provide context</p>
    </div>
  </div>

  <!-- Empty state when no question is linked -->
  <div v-else class="space-y-4">
    <div class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <Icon icon="heroicons:star" class="mx-auto h-12 w-12 text-gray-300" />
      <h3 class="mt-4 text-sm font-medium text-gray-900">No rating question linked</h3>
      <p class="mt-2 text-sm text-gray-500">
        This step doesn't have a rating question associated with it yet.
      </p>
    </div>
  </div>
</template>
