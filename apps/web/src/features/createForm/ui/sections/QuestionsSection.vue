<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import FormSectionHeader from '../FormSectionHeader.vue';
import QuestionList from '../questionEditor/QuestionList.vue';
import QuestionEditorPanel from '../questionEditor/QuestionEditorPanel.vue';
import AIThinkingLoader from '../aiLoader/AIThinkingLoader.vue';
import { useQuestionPanelUrl } from '../../composables';
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
  /** Save a specific question by index */
  saveQuestion: [index: number];
}>();

// URL-synced add panel state
const {
  isAddPanelOpen,
  openAddPanel,
  closeAddPanel,
} = useQuestionPanelUrl({
  totalQuestions: () => props.questions.length,
});

// Next display order for new questions
const nextDisplayOrder = computed(() => props.questions.length + 1);

// Section status
const sectionStatus = computed<SectionStatus>(() => {
  if (props.isGenerating) return 'in-progress';
  if (props.questions.length > 0) return 'complete';
  return 'incomplete';
});

// Count unsaved questions
const unsavedCount = computed(() =>
  props.questions.filter((q) => q.isModified || q.isNew).length
);

// Badge shows unsaved count or question count
const badge = computed(() => {
  if (unsavedCount.value > 0) return `${unsavedCount.value} unsaved`;
  if (props.questions.length === 0) return undefined;
  return `${props.questions.length} questions`;
});

function handleToggle() {
  if (!props.disabled) {
    emit('update:expanded', !props.expanded);
  }
}

function handleAddQuestion(question: QuestionData) {
  emit('addQuestion', question);
  closeAddPanel();
}

function handleRegenerate() {
  emit('regenerate');
}

function handleSaveQuestions() {
  emit('saveQuestions');
}

function handleSaveQuestion(index: number) {
  emit('saveQuestion', index);
}

// Track "just saved" state for success feedback
const justSaved = ref(false);

// Watch for save completion to show success state
watch(
  [() => props.isSaving, () => props.hasUnsavedChanges],
  ([newSaving, newHasUnsaved], [oldSaving]) => {
    // Transition from saving to not-saving with no unsaved changes = success
    if (oldSaving && !newSaving && !newHasUnsaved) {
      justSaved.value = true;
      setTimeout(() => {
        justSaved.value = false;
      }, 1500);
    }
  }
);

// Keyboard shortcut: ⌘S / Ctrl+S to save all questions
onKeyStroke('s', (e) => {
  if (
    (e.metaKey || e.ctrlKey) &&
    props.expanded &&
    props.hasUnsavedChanges &&
    !props.isSaving
  ) {
    e.preventDefault();
    handleSaveQuestions();
  }
});
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <FormSectionHeader
      title="Questions"
      subtitle="AI-generated questions for your testimonial form"
      icon="lucide:message-square-text"
      :expanded="expanded"
      :disabled="disabled"
      :has-unsaved="unsavedCount > 0"
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
              :is-saving="isSaving"
              @update="(index, updates) => emit('updateQuestion', index, updates)"
              @remove="(index) => emit('removeQuestion', index)"
              @reorder="(from, to) => emit('reorderQuestions', from, to)"
              @save="handleSaveQuestion"
            />

            <!-- Action buttons -->
            <div class="flex items-center justify-between pt-2">
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="handleRegenerate">
                  <Icon icon="lucide:refresh-cw" class="mr-2 h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" @click="openAddPanel">
                  <Icon icon="lucide:plus" class="mr-2 h-3.5 w-3.5" />
                  Add Question
                </Button>
              </div>

              <!-- Save status pill -->
              <template v-if="hasUnsavedChanges || isSaving || justSaved">
                <!-- Saved state (green) -->
                <div
                  v-if="justSaved"
                  class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
                >
                  <Icon icon="lucide:check" class="h-3 w-3" />
                  Saved
                </div>
                <!-- Unsaved/Saving state (amber) -->
                <button
                  v-else
                  type="button"
                  :disabled="isSaving"
                  class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                  @click="handleSaveQuestions"
                >
                  <Icon
                    v-if="isSaving"
                    icon="lucide:loader-2"
                    class="h-3 w-3 animate-spin"
                  />
                  <span v-else class="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {{ isSaving ? 'Saving...' : `${unsavedCount} unsaved` }}
                  <kbd
                    v-if="!isSaving"
                    class="ml-0.5 rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[10px] text-amber-600"
                  >
                    ⌘S
                  </kbd>
                </button>
              </template>
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

    <!-- Add Question Panel -->
    <QuestionEditorPanel
      mode="add"
      :open="isAddPanelOpen"
      :next-display-order="nextDisplayOrder"
      @update:open="(v) => v ? openAddPanel() : closeAddPanel()"
      @add="handleAddQuestion"
    />
  </div>
</template>
