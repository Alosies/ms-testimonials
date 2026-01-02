<script setup lang="ts">
import { toRef, ref, watch, nextTick } from 'vue';
import { onKeyStroke } from '@vueuse/core';
import { Sheet, SheetContent } from '@testimonials/ui';
import type { QuestionData } from '../../models';
import { useQuestionEditorPanel, type PanelMode } from '../../composables';
import QuestionEditorPanelHeader from './childComponents/QuestionEditorPanelHeader.vue';
import QuestionPreview from './childComponents/QuestionPreview.vue';
import QuestionEditorForm from './childComponents/QuestionEditorForm.vue';
import QuestionTypeTips from './childComponents/QuestionTypeTips.vue';

// Template ref for the form component (to call focusQuestionText)
const editorFormRef = ref<InstanceType<typeof QuestionEditorForm> | null>(null);

const props = withDefaults(
  defineProps<{
    /** Panel mode: 'add' for new questions, 'edit' for existing */
    mode?: PanelMode;
    /** Question to edit (edit mode only) */
    question?: QuestionData | null;
    /** Index of question being edited (edit mode only) */
    questionIndex?: number;
    /** Total number of questions (edit mode only) */
    totalQuestions?: number;
    /** Display order for new question (add mode only) */
    nextDisplayOrder?: number;
    /** Whether panel is open */
    open: boolean;
    /** Whether current question has unsaved changes (edit mode only) */
    isDirty?: boolean;
    /** Whether save is in progress (edit mode only) */
    isSaving?: boolean;
  }>(),
  {
    mode: 'edit',
    question: null,
    questionIndex: 0,
    totalQuestions: 0,
    nextDisplayOrder: 1,
    isDirty: false,
    isSaving: false,
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  /** Emitted when question is updated (edit mode) */
  update: [updates: Partial<QuestionData>];
  /** Emitted when question is deleted (edit mode) */
  remove: [];
  /** Emitted when navigating between questions (edit mode) */
  navigate: [direction: 'prev' | 'next'];
  /** Emitted when new question is added (add mode) */
  add: [question: QuestionData];
  /** Emitted when save button is clicked (edit mode) */
  save: [];
}>();

// Build composable options based on mode (called once at setup)
const composableOptions = props.mode === 'add'
  ? {
      mode: 'add' as const,
      nextDisplayOrder: props.nextDisplayOrder,
      onAdd: (question: QuestionData) => emit('add', question),
      onOpenChange: (value: boolean) => emit('update:open', value),
    }
  : {
      mode: 'edit' as const,
      question: toRef(props, 'question'),
      questionIndex: toRef(props, 'questionIndex'),
      totalQuestions: toRef(props, 'totalQuestions'),
      onUpdate: (updates: Partial<QuestionData>) => emit('update', updates),
      onRemove: () => emit('remove'),
      onNavigate: (direction: 'prev' | 'next') => emit('navigate', direction),
      onOpenChange: (value: boolean) => emit('update:open', value),
    };

// Use composable for all logic
const {
  isEditMode,
  localQuestion,
  questionTypes,
  isNavigationEnabled,
  hasKeyboard,
  isTransitioning,
  questionTypeIcon,
  supportsOptions,
  isRequired,
  isValid,
  updateField,
  addOption,
  updateOption,
  removeOption,
  handleHeaderKeydown,
  navigateWithTransition,
  enableNavigation,
  disableNavigation,
  handleDeleteClick,
  handleAddQuestion,
  closePanel,
} = useQuestionEditorPanel(composableOptions);

// Auto-focus question text input in add mode when panel opens
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.mode === 'add') {
      await nextTick();
      // Small delay to ensure sheet animation has started
      setTimeout(() => {
        editorFormRef.value?.focusQuestionText();
      }, 100);
    }
  },
  { immediate: true }
);

// Keyboard shortcut: ⌘S / Ctrl+S to save
onKeyStroke('s', (e) => {
  if ((e.metaKey || e.ctrlKey) && props.open && props.isDirty && !props.isSaving && isEditMode) {
    e.preventDefault();
    emit('save');
  }
});

// Track "just saved" state for success feedback
const justSaved = ref(false);

watch(
  [() => props.isSaving, () => props.isDirty],
  ([newSaving, newDirty], [oldSaving]) => {
    // Save completed: was saving, now not saving, and no longer dirty
    if (oldSaving && !newSaving && !newDirty) {
      justSaved.value = true;
      setTimeout(() => {
        justSaved.value = false;
      }, 1500);
    }
  }
);
</script>

<template>
  <Sheet :open="open" @update:open="(v) => emit('update:open', v)">
    <SheetContent
      side="right"
      size="wide"
      class="flex flex-col gap-0 overflow-hidden p-0 [&>button]:hidden"
    >
      <!-- Header -->
      <QuestionEditorPanelHeader
        :is-edit-mode="isEditMode"
        :question-index="questionIndex"
        :total-questions="totalQuestions"
        :is-dirty="isDirty"
        :is-saving="isSaving"
        :just-saved="justSaved"
        :is-navigation-enabled="isNavigationEnabled"
        :has-keyboard="hasKeyboard"
        :is-valid="isValid"
        @navigate="navigateWithTransition"
        @delete="handleDeleteClick"
        @close="closePanel"
        @add="handleAddQuestion"
        @save="emit('save')"
        @header-keydown="handleHeaderKeydown"
        @enable-navigation="enableNavigation"
        @disable-navigation="disableNavigation"
      />

      <!-- Two-Column Layout -->
      <div v-if="localQuestion" class="flex flex-1 overflow-hidden">
        <!-- Main Content Column with smooth transition -->
        <div
          :class="[
            'flex-1 overflow-y-auto bg-gray-50 scrollbar-subtle transition-opacity duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100',
          ]"
        >
          <!-- Live Preview -->
          <QuestionPreview :question="localQuestion" />

          <!-- Editor Form Section -->
          <QuestionEditorForm
            ref="editorFormRef"
            :question="localQuestion"
            :question-types="questionTypes"
            :question-type-icon="questionTypeIcon"
            :supports-options="supportsOptions"
            :is-required="isRequired"
            @update:is-required="(v) => (isRequired = v)"
            @update-field="updateField"
            @add-option="addOption"
            @update-option="updateOption"
            @remove-option="removeOption"
          />
        </div>

        <!-- Tips Aside with smooth transition -->
        <QuestionTypeTips
          :question-type-id="localQuestion.question_type_id"
          :class="[
            'w-72 shrink-0 overflow-y-auto scrollbar-subtle transition-opacity duration-150',
            isTransitioning ? 'opacity-0' : 'opacity-100',
          ]"
        />
      </div>
    </SheetContent>
  </Sheet>
</template>
