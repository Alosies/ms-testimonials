<script setup lang="ts">
import { computed, toRefs, watch, ref } from 'vue';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Separator,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { useOrganizationStore } from '@/entities/organization';
import type { QuestionTypeId, AIQuestionOption } from '@/shared/api';
import type { QuestionData } from '../models';

const props = defineProps<{
  question: QuestionData | null;
  questionIndex: number;
  totalQuestions: number;
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  update: [updates: Partial<QuestionData>];
  remove: [];
  navigate: [direction: 'prev' | 'next'];
}>();

// Get allowed question types from organization's plan
const organizationStore = useOrganizationStore();
const { questionTypeOptions: questionTypes } = toRefs(organizationStore);

// Local editing state for immediate feedback
const localQuestion = ref<QuestionData | null>(null);

// Sync local state with prop changes
watch(
  () => props.question,
  (newQuestion) => {
    if (newQuestion) {
      localQuestion.value = { ...newQuestion };
    }
  },
  { immediate: true, deep: true }
);

// Find current question type details
const currentQuestionType = computed(() =>
  questionTypes.value.find((t) => t.id === localQuestion.value?.question_type_id)
);

const questionTypeIcon = computed(() => currentQuestionType.value?.icon ?? 'minus');
const supportsOptions = computed(() => currentQuestionType.value?.supportsOptions ?? false);

// Map icon names to heroicons format
function getHeroIconName(iconName: string | null | undefined): string {
  if (!iconName) return 'heroicons:minus';
  return `heroicons:${iconName}`;
}

// Update local state and emit to parent
function updateField<K extends keyof QuestionData>(field: K, value: QuestionData[K]) {
  if (!localQuestion.value) return;
  localQuestion.value = { ...localQuestion.value, [field]: value };
  emit('update', { [field]: value });
}

// Options management for choice questions
function addOption() {
  if (!localQuestion.value) return;
  const currentOptions = localQuestion.value.options ?? [];
  const newOption: AIQuestionOption = {
    option_value: `option_${currentOptions.length + 1}`,
    option_label: '',
    display_order: currentOptions.length + 1,
  };
  updateField('options', [...currentOptions, newOption]);
}

function updateOption(optionIndex: number, updates: Partial<AIQuestionOption>) {
  if (!localQuestion.value) return;
  const currentOptions = localQuestion.value.options ?? [];
  const updatedOptions = currentOptions.map((opt, idx) =>
    idx === optionIndex ? { ...opt, ...updates } : opt
  );
  updateField('options', updatedOptions);
}

function removeOption(optionIndex: number) {
  if (!localQuestion.value) return;
  const currentOptions = localQuestion.value.options ?? [];
  const updatedOptions = currentOptions
    .filter((_, idx) => idx !== optionIndex)
    .map((opt, idx) => ({ ...opt, display_order: idx + 1 }));
  updateField('options', updatedOptions.length > 0 ? updatedOptions : null);
}

// Auto-generate option_value from label
function generateOptionValue(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || `option_${Date.now()}`
  );
}

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' && props.questionIndex > 0) {
    event.preventDefault();
    emit('navigate', 'prev');
  } else if (event.key === 'ArrowDown' && props.questionIndex < props.totalQuestions - 1) {
    event.preventDefault();
    emit('navigate', 'next');
  }
}

// Handle panel open/close
function handleOpenChange(value: boolean) {
  emit('update:open', value);
}
</script>

<template>
  <Sheet :open="open" @update:open="handleOpenChange">
    <SheetContent
      side="right"
      size="wide"
      class="flex flex-col overflow-hidden p-0"
      @keydown="handleKeydown"
    >
      <!-- Header with Navigation -->
      <div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
        <SheetHeader class="flex-1 space-y-0">
          <div class="flex items-center gap-3">
            <!-- Navigation Arrows -->
            <div class="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                :disabled="questionIndex <= 0"
                @click="emit('navigate', 'prev')"
              >
                <Icon icon="lucide:chevron-up" class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                :disabled="questionIndex >= totalQuestions - 1"
                @click="emit('navigate', 'next')"
              >
                <Icon icon="lucide:chevron-down" class="h-4 w-4" />
              </Button>
            </div>

            <div>
              <SheetTitle class="text-base">
                Question {{ questionIndex + 1 }} of {{ totalQuestions }}
              </SheetTitle>
              <p class="text-xs text-gray-500">Use ↑↓ arrows to navigate</p>
            </div>
          </div>
        </SheetHeader>

        <!-- Delete Button -->
        <Button
          variant="ghost"
          size="sm"
          class="text-red-500 hover:bg-red-50 hover:text-red-600"
          @click="emit('remove')"
        >
          <Icon icon="lucide:trash-2" class="mr-1.5 h-4 w-4" />
          Delete
        </Button>
      </div>

      <!-- Scrollable Content -->
      <div v-if="localQuestion" class="flex-1 overflow-y-auto">
        <!-- Live Preview Section -->
        <div class="border-b bg-gradient-to-br from-gray-50 to-white p-6">
          <div class="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            <Icon icon="lucide:eye" class="h-3.5 w-3.5" />
            Live Preview
          </div>

          <div class="rounded-lg border bg-white p-4 shadow-sm">
            <!-- Question Preview -->
            <div class="space-y-3">
              <div class="flex items-start gap-2">
                <span class="text-sm font-medium text-gray-900">
                  {{ localQuestion.question_text || 'Enter your question...' }}
                </span>
                <span v-if="localQuestion.is_required" class="text-red-500">*</span>
              </div>

              <!-- Input Preview based on type -->
              <div class="pointer-events-none">
                <!-- Text Input Preview -->
                <div
                  v-if="localQuestion.question_type_id === 'text_short'"
                  class="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-400"
                >
                  {{ localQuestion.placeholder || 'Short answer text' }}
                </div>

                <!-- Textarea Preview -->
                <div
                  v-else-if="localQuestion.question_type_id === 'text_long'"
                  class="min-h-[80px] rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-400"
                >
                  {{ localQuestion.placeholder || 'Long answer text' }}
                </div>

                <!-- Star Rating Preview -->
                <div
                  v-else-if="localQuestion.question_type_id === 'rating_star'"
                  class="flex gap-1"
                >
                  <Icon
                    v-for="i in 5"
                    :key="i"
                    icon="lucide:star"
                    class="h-6 w-6 text-gray-300"
                  />
                </div>

                <!-- Choice Preview -->
                <div
                  v-else-if="supportsOptions"
                  class="space-y-2"
                >
                  <div
                    v-for="(option, idx) in (localQuestion.options || [])"
                    :key="idx"
                    class="flex items-center gap-2 text-sm"
                  >
                    <div
                      :class="[
                        'h-4 w-4 border',
                        localQuestion.question_type_id === 'choice_single'
                          ? 'rounded-full'
                          : 'rounded',
                      ]"
                    />
                    <span class="text-gray-700">{{ option.option_label || `Option ${idx + 1}` }}</span>
                  </div>
                  <div v-if="!localQuestion.options?.length" class="text-sm text-gray-400 italic">
                    Add options below...
                  </div>
                </div>

                <!-- Default Preview -->
                <div
                  v-else
                  class="rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-400"
                >
                  {{ localQuestion.placeholder || 'Answer input' }}
                </div>
              </div>

              <!-- Help Text Preview -->
              <p v-if="localQuestion.help_text" class="text-xs text-gray-500">
                {{ localQuestion.help_text }}
              </p>
            </div>
          </div>
        </div>

        <!-- Editor Form -->
        <div class="space-y-6 p-6">
          <!-- Question Text -->
          <div>
            <Label class="text-sm font-medium">Question Text</Label>
            <Textarea
              :model-value="localQuestion.question_text"
              class="mt-1.5"
              rows="3"
              placeholder="Enter your question..."
              @update:model-value="(v) => updateField('question_text', String(v))"
            />
          </div>

          <!-- Type and Required Row -->
          <div class="flex gap-4">
            <!-- Question Type -->
            <div class="flex-1">
              <Label class="text-sm font-medium">Question Type</Label>
              <Select
                :model-value="localQuestion.question_type_id"
                @update:model-value="(v) => updateField('question_type_id', v as QuestionTypeId)"
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
                  <SelectItem
                    v-for="type in questionTypes"
                    :key="type.id"
                    :value="type.id"
                  >
                    <div class="flex items-center gap-2">
                      <Icon
                        :icon="getHeroIconName(type.icon)"
                        class="h-4 w-4 text-gray-500"
                      />
                      <span>{{ type.name }}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Required Toggle -->
            <div class="flex flex-col justify-end">
              <div class="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-2.5">
                <Label class="text-sm">Required</Label>
                <Switch
                  :checked="localQuestion.is_required"
                  @update:checked="(v: boolean) => updateField('is_required', v)"
                />
              </div>
            </div>
          </div>

          <!-- Options Section for Choice Questions -->
          <div v-if="supportsOptions">
            <Separator class="my-4" />

            <div class="rounded-lg border bg-gray-50 p-4">
              <div class="mb-3 flex items-center justify-between">
                <Label class="text-sm font-medium">Answer Options</Label>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-8"
                  @click="addOption"
                >
                  <Icon icon="lucide:plus" class="mr-1.5 h-3.5 w-3.5" />
                  Add Option
                </Button>
              </div>

              <div
                v-if="!localQuestion.options?.length"
                class="rounded-md border-2 border-dashed border-gray-200 py-6 text-center"
              >
                <Icon icon="lucide:list" class="mx-auto h-8 w-8 text-gray-300" />
                <p class="mt-2 text-sm text-gray-500">
                  No options added yet
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  class="mt-2"
                  @click="addOption"
                >
                  Add your first option
                </Button>
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="(option, optIndex) in localQuestion.options"
                  :key="optIndex"
                  class="flex items-center gap-2"
                >
                  <!-- Visual indicator -->
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center">
                    <div
                      :class="[
                        'h-4 w-4 border-2 border-gray-300',
                        localQuestion.question_type_id === 'choice_single'
                          ? 'rounded-full'
                          : 'rounded',
                      ]"
                    />
                  </div>

                  <Input
                    :model-value="option.option_label"
                    class="flex-1"
                    placeholder="Enter option text..."
                    @update:model-value="
                      (v) =>
                        updateOption(optIndex, {
                          option_label: String(v),
                          option_value: generateOptionValue(String(v)),
                        })
                    "
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
                    @click="removeOption(optIndex)"
                  >
                    <Icon icon="lucide:x" class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator class="my-4" />

          <!-- Placeholder Text -->
          <div>
            <Label class="text-sm font-medium">Placeholder Text</Label>
            <Input
              :model-value="localQuestion.placeholder ?? ''"
              class="mt-1.5"
              placeholder="Hint text shown in the input..."
              @update:model-value="(v) => updateField('placeholder', String(v) || null)"
            />
            <p class="mt-1 text-xs text-gray-500">
              Displayed as a hint inside the input field
            </p>
          </div>

          <!-- Help Text -->
          <div>
            <Label class="text-sm font-medium">Help Text</Label>
            <Input
              :model-value="localQuestion.help_text ?? ''"
              class="mt-1.5"
              placeholder="Additional guidance for respondents..."
              @update:model-value="(v) => updateField('help_text', String(v) || null)"
            />
            <p class="mt-1 text-xs text-gray-500">
              Shown below the question to provide context
            </p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
