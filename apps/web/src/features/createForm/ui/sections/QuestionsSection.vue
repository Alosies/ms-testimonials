<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import FormSectionHeader from '../FormSectionHeader.vue';
import QuestionList from '../questionEditor/QuestionList.vue';
import AddQuestionModal from '../modals/AddQuestionModal.vue';
import AIThinkingLoader from '../aiLoader/AIThinkingLoader.vue';
import type { FormData, QuestionData } from '../../models';
import type { SectionStatus } from '../FormSectionHeader.vue';
import type { AIContext } from '@/shared/api';

const props = defineProps<{
  expanded: boolean;
  disabled: boolean;
  questions: QuestionData[];
  formData: FormData;
  formId: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  aiContext: AIContext | null;
  hasUnsavedChanges: boolean;
}>();

const emit = defineEmits<{
  'update:expanded': [value: boolean];
  updateQuestion: [index: number, updates: Partial<QuestionData>];
  removeQuestion: [index: number];
  addQuestion: [question: Partial<QuestionData>];
  reorderQuestions: [fromIndex: number, toIndex: number];
  regenerate: [];
  saveQuestions: [];
}>();

const showAddQuestion = ref(false);

// Section status
const sectionStatus = computed<SectionStatus>(() => {
  if (props.isGenerating) return 'in-progress';
  if (props.questions.length > 0) return 'complete';
  return 'incomplete';
});

// Badge shows question count
const badge = computed(() => {
  if (props.questions.length === 0) return undefined;
  return `${props.questions.length} questions`;
});

function handleToggle() {
  if (!props.disabled) {
    emit('update:expanded', !props.expanded);
  }
}

function handleAddQuestion(question: Partial<QuestionData>) {
  emit('addQuestion', question);
  showAddQuestion.value = false;
}

function handleRegenerate() {
  emit('regenerate');
}

function handleSaveQuestions() {
  emit('saveQuestions');
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <FormSectionHeader
      title="Questions"
      subtitle="AI-generated questions for your testimonial form"
      icon="lucide:message-square-text"
      :expanded="expanded"
      :disabled="disabled"
      :status="sectionStatus"
      :badge="badge"
      @toggle="handleToggle"
    />

    <div
      v-show="expanded && !disabled"
      class="border-t border-gray-100"
    >
      <!-- Loading state -->
      <div v-if="isGenerating" class="p-6">
        <AIThinkingLoader :product-name="formData.product_name" />
      </div>

      <!-- Questions content -->
      <template v-else-if="questions.length > 0">
        <div class="flex gap-6 p-4">
          <!-- Main Content -->
          <div class="flex-1 space-y-4">
            <!-- Question List -->
            <QuestionList
              :questions="questions"
              @update="(index, updates) => emit('updateQuestion', index, updates)"
              @remove="(index) => emit('removeQuestion', index)"
              @reorder="(from, to) => emit('reorderQuestions', from, to)"
            />

            <!-- Action buttons -->
            <div class="flex items-center justify-between pt-2">
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="handleRegenerate">
                  <Icon icon="lucide:refresh-cw" class="mr-2 h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" @click="showAddQuestion = true">
                  <Icon icon="lucide:plus" class="mr-2 h-3.5 w-3.5" />
                  Add Question
                </Button>
              </div>

              <div v-if="hasUnsavedChanges" class="flex items-center gap-3">
                <span class="text-xs text-amber-600">
                  <Icon icon="lucide:alert-circle" class="mr-1 inline h-3.5 w-3.5" />
                  Unsaved changes
                </span>
                <Button
                  size="sm"
                  :disabled="isSaving"
                  @click="handleSaveQuestions"
                >
                  <Icon
                    v-if="isSaving"
                    icon="lucide:loader-2"
                    class="mr-2 h-3.5 w-3.5 animate-spin"
                  />
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Sidebar: AI Analysis -->
          <aside v-if="aiContext" class="hidden w-48 shrink-0 lg:block">
            <div class="sticky top-4 space-y-3 rounded-lg border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-3">
              <div class="flex items-center gap-1.5 text-xs font-medium text-teal-700">
                <Icon icon="lucide:sparkles" class="h-3.5 w-3.5" />
                AI Analysis
              </div>

              <div class="space-y-2">
                <div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-teal-600">
                    Industry
                  </p>
                  <p class="text-xs font-medium text-teal-900">
                    {{ aiContext.industry }}
                  </p>
                </div>

                <div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-teal-600">
                    Audience
                  </p>
                  <p class="text-xs font-medium text-teal-900">
                    {{ aiContext.audience }}
                  </p>
                </div>

                <div>
                  <p class="text-[10px] font-medium uppercase tracking-wide text-teal-600">
                    Tone
                  </p>
                  <p class="text-xs font-medium text-teal-900">
                    {{ aiContext.tone }}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </template>

      <!-- Empty state (shouldn't normally be visible) -->
      <div v-else class="p-6 text-center text-sm text-gray-500">
        No questions yet. Fill in product info and click "Generate Questions" above.
      </div>
    </div>

    <!-- Add Question Modal -->
    <AddQuestionModal
      v-if="showAddQuestion"
      @add="handleAddQuestion"
      @close="showAddQuestion = false"
    />
  </div>
</template>
