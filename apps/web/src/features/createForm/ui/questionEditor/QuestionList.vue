<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { QuestionData } from '../../models';
import { useQuestionPanelUrl } from '../../composables';
import QuestionCard from './QuestionCard.vue';
import QuestionEditorPanel from './QuestionEditorPanel.vue';

const props = defineProps<{
  questions: QuestionData[];
}>();

const emit = defineEmits<{
  update: [index: number, updates: Partial<QuestionData>];
  remove: [index: number];
  reorder: [fromIndex: number, toIndex: number];
}>();

// Local copy for drag operations
const localQuestions = ref([...props.questions]);

// URL-synced selection state for editor panel
const {
  selectedIndex,
  isPanelOpen,
  selectQuestion,
  closePanel,
  navigate,
  adjustIndexForReorder,
  adjustIndexForRemoval,
} = useQuestionPanelUrl({
  totalQuestions: () => localQuestions.value.length,
});

// Keep local copy in sync with props
watch(
  () => props.questions,
  (newQuestions) => {
    localQuestions.value = [...newQuestions];
    // Close panel if selected question was removed
    if (selectedIndex.value !== null && selectedIndex.value >= newQuestions.length) {
      closePanel();
    }
  },
  { deep: true }
);

// Get selected question
const selectedQuestion = computed(() =>
  selectedIndex.value !== null ? localQuestions.value[selectedIndex.value] : null
);

// Drag state
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

function onDragStart(index: number, event: DragEvent) {
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function onDragOver(index: number, event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  dragOverIndex.value = index;
}

function onDragLeave() {
  dragOverIndex.value = null;
}

function onDrop(toIndex: number, event: DragEvent) {
  event.preventDefault();
  const fromIndex = draggedIndex.value;

  if (fromIndex !== null && fromIndex !== toIndex) {
    emit('reorder', fromIndex, toIndex);
    // Adjust URL-synced selection if needed
    adjustIndexForReorder(fromIndex, toIndex);
  }

  draggedIndex.value = null;
  dragOverIndex.value = null;
}

function onDragEnd() {
  draggedIndex.value = null;
  dragOverIndex.value = null;
}

// Selection handlers
function handleSelect(index: number) {
  selectQuestion(index);
}

function handlePanelClose() {
  closePanel();
}

function handleUpdate(updates: Partial<QuestionData>) {
  if (selectedIndex.value !== null) {
    emit('update', selectedIndex.value, updates);
  }
}

function handleRemoveFromPanel() {
  if (selectedIndex.value !== null) {
    const indexToRemove = selectedIndex.value;
    closePanel();
    emit('remove', indexToRemove);
  }
}

function handleRemoveFromCard(index: number) {
  // Adjust URL-synced selection for removal
  adjustIndexForRemoval(index);
  emit('remove', index);
}

function handleNavigate(direction: 'prev' | 'next') {
  navigate(direction);
}
</script>

<template>
  <div>
    <!-- Question Cards -->
    <div class="space-y-3">
      <div
        v-for="(question, index) in localQuestions"
        :key="question.question_key"
        class="transition-transform"
        :class="{
          'opacity-50': draggedIndex === index,
          'border-t-2 border-primary': dragOverIndex === index && draggedIndex !== index,
        }"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover="onDragOver(index, $event)"
        @dragleave="onDragLeave"
        @drop="onDrop(index, $event)"
        @dragend="onDragEnd"
      >
        <QuestionCard
          :question="question"
          :index="index"
          :is-selected="selectedIndex === index"
          @select="handleSelect"
          @remove="handleRemoveFromCard"
        />
      </div>

      <div
        v-if="localQuestions.length === 0"
        class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
      >
        <p class="text-gray-500">No questions yet. Add a custom question below.</p>
      </div>
    </div>

    <!-- Editor Panel -->
    <QuestionEditorPanel
      :question="selectedQuestion"
      :question-index="selectedIndex ?? 0"
      :total-questions="localQuestions.length"
      :open="isPanelOpen"
      @update:open="(v) => (v ? null : handlePanelClose())"
      @update="handleUpdate"
      @remove="handleRemoveFromPanel"
      @navigate="handleNavigate"
    />
  </div>
</template>
