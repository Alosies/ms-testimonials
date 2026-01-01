<script setup lang="ts">
import { toRef } from 'vue';
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
  Separator,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import type { QuestionTypeId } from '@/shared/api';
import type { QuestionData } from '../../models';
import { useQuestionEditorPanel } from '../../composables';
import QuestionPreview from './childComponents/QuestionPreview.vue';
import QuestionOptionsEditor from './childComponents/QuestionOptionsEditor.vue';

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

// Use composable for all logic
const {
  localQuestion,
  questionTypes,
  questionTypeIcon,
  supportsOptions,
  getHeroIconName,
  updateField,
  addOption,
  updateOption,
  removeOption,
  handleKeydown,
  handleDeleteClick,
  closePanel,
} = useQuestionEditorPanel({
  question: toRef(props, 'question'),
  questionIndex: toRef(props, 'questionIndex'),
  totalQuestions: toRef(props, 'totalQuestions'),
  onUpdate: (updates) => emit('update', updates),
  onRemove: () => emit('remove'),
  onNavigate: (direction) => emit('navigate', direction),
  onOpenChange: (value) => emit('update:open', value),
});
</script>

<template>
  <Sheet :open="open" @update:open="(v) => emit('update:open', v)">
    <SheetContent
      side="right"
      size="wide"
      class="flex flex-col overflow-hidden p-0 [&>button]:hidden"
      @keydown="handleKeydown"
    >
      <!-- Header with Navigation -->
      <div class="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
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
            <h2 class="text-base font-semibold text-gray-900">
              Question {{ questionIndex + 1 }} of {{ totalQuestions }}
            </h2>
            <p class="text-xs text-gray-500">Use ↑↓ arrows to navigate</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            class="text-red-500 hover:bg-red-50 hover:text-red-600"
            @click="handleDeleteClick"
          >
            <Icon icon="lucide:trash-2" class="mr-1.5 h-4 w-4" />
            Delete
          </Button>
          <div class="mx-1 h-6 w-px bg-gray-200" />
          <Button variant="ghost" size="icon" class="h-8 w-8" @click="closePanel">
            <Icon icon="lucide:x" class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div v-if="localQuestion" class="flex-1 overflow-y-auto">
        <!-- Live Preview -->
        <QuestionPreview :question="localQuestion" :supports-options="supportsOptions" />

        <!-- Editor Form Section -->
        <div class="bg-white">
          <!-- Section Header -->
          <div class="border-b bg-white px-6 py-4">
            <div class="flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                <Icon icon="lucide:settings-2" class="h-3.5 w-3.5 text-gray-600" />
              </div>
              <span class="text-sm font-medium text-gray-700">Question Settings</span>
            </div>
          </div>

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
            <QuestionOptionsEditor
              v-if="supportsOptions"
              :options="localQuestion.options"
              :question-type-id="localQuestion.question_type_id"
              @add="addOption"
              @update="updateOption"
              @remove="removeOption"
            />

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
              <p class="mt-1 text-xs text-gray-500">Displayed as a hint inside the input field</p>
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
              <p class="mt-1 text-xs text-gray-500">Shown below the question to provide context</p>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
