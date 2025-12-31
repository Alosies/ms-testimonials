<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Button,
  Input,
  Textarea,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useGetQuestionTypes } from '@/entities/questionType';
import type { QuestionData } from '../models';

const props = defineProps<{
  question: QuestionData;
  index: number;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  update: [index: number, updates: Partial<QuestionData>];
  remove: [index: number];
}>();

const { questionTypes } = useGetQuestionTypes();
const isExpanded = ref(false);

const questionTypeLabel = computed(() => {
  const type = questionTypes.value.find(
    (t) => t.id === props.question.question_type_id
  );
  return type?.name ?? props.question.question_type_id;
});

function toggleExpanded() {
  if (!props.readonly) {
    isExpanded.value = !isExpanded.value;
  }
}

function updateField<K extends keyof QuestionData>(
  field: K,
  value: QuestionData[K]
) {
  emit('update', props.index, { [field]: value });
}
</script>

<template>
  <Card
    class="transition-shadow"
    :class="{ 'hover:shadow-md': !readonly, 'cursor-pointer': !readonly }"
  >
    <CardContent class="p-4">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <!-- Drag Handle -->
        <div
          v-if="!readonly"
          class="mt-1 cursor-grab text-gray-400 hover:text-gray-600"
        >
          <Icon icon="lucide:grip-vertical" class="h-5 w-5" />
        </div>

        <!-- Question Number -->
        <div
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600"
        >
          {{ index + 1 }}
        </div>

        <!-- Question Content -->
        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-sm text-gray-900">
                {{ question.question_text }}
              </p>
              <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span
                  class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600"
                >
                  {{ questionTypeLabel }}
                </span>
                <span v-if="question.is_required" class="text-red-500"
                  >Required</span
                >
              </div>
            </div>

            <!-- Actions -->
            <div v-if="!readonly" class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                @click.stop="toggleExpanded"
              >
                <Icon
                  :icon="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
                  class="h-4 w-4"
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 text-red-500 hover:text-red-600"
                @click.stop="emit('remove', index)"
              >
                <Icon icon="lucide:trash-2" class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Expanded Edit Form -->
          <div v-if="isExpanded && !readonly" class="mt-4 space-y-4 border-t pt-4">
            <!-- Question Text -->
            <div>
              <Label>Question Text</Label>
              <Textarea
                :model-value="question.question_text"
                class="mt-1"
                rows="2"
                @update:model-value="(v) => updateField('question_text', String(v))"
              />
            </div>

            <!-- Question Type -->
            <div>
              <Label>Question Type</Label>
              <Select
                :model-value="question.question_type_id"
                @update:model-value="(v) => updateField('question_type_id', String(v))"
              >
                <SelectTrigger class="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="type in questionTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    {{ type.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Placeholder -->
            <div>
              <Label>Placeholder Text</Label>
              <Input
                :model-value="question.placeholder ?? ''"
                class="mt-1"
                placeholder="Enter placeholder text..."
                @update:model-value="(v) => updateField('placeholder', String(v) || null)"
              />
            </div>

            <!-- Help Text -->
            <div>
              <Label>Help Text</Label>
              <Input
                :model-value="question.help_text ?? ''"
                class="mt-1"
                placeholder="Enter help text..."
                @update:model-value="(v) => updateField('help_text', String(v) || null)"
              />
            </div>

            <!-- Required Toggle -->
            <div class="flex items-center justify-between">
              <Label>Required</Label>
              <Switch
                :checked="question.is_required"
                @update:checked="(v: boolean) => updateField('is_required', v)"
              />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
