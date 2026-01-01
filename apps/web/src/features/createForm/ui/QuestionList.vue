<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { QuestionData } from '../models';
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

// Selection state for editor panel
const selectedIndex = ref<number | null>(null);
const isPanelOpen = ref(false);

// Keep local copy in sync with props
watch(
  () => props.questions,
  (newQuestions) => {
    localQuestions.value = [...newQuestions];
    // Close panel if selected question was removed
    if (selectedIndex.value !== null && selectedIndex.value >= newQuestions.length) {
      selectedIndex.value = null;
      isPanelOpen.value = false;
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

    // Update selected index if needed
    if (selectedIndex.value === fromIndex) {
      selectedIndex.value = toIndex;
    } else if (
      selectedIndex.value !== null &&
      fromIndex < selectedIndex.value &&
      toIndex >= selectedIndex.value
    ) {
      selectedIndex.value--;
    } else if (
      selectedIndex.value !== null &&
      fromIndex > selectedIndex.value &&
      toIndex <= selectedIndex.value
    ) {
      selectedIndex.value++;
    }
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
  selectedIndex.value = index;
  isPanelOpen.value = true;
}

function handlePanelClose() {
  isPanelOpen.value = false;
  // Keep selection visible for a moment, then clear
  setTimeout(() => {
    if (!isPanelOpen.value) {
      selectedIndex.value = null;
    }
  }, 300);
}

function handleUpdate(updates: Partial<QuestionData>) {
  if (selectedIndex.value !== null) {
    emit('update', selectedIndex.value, updates);
  }
}

function handleRemoveFromPanel() {
  if (selectedIndex.value !== null) {
    const indexToRemove = selectedIndex.value;
    isPanelOpen.value = false;
    selectedIndex.value = null;
    emit('remove', indexToRemove);
  }
}

function handleRemoveFromCard(index: number) {
  // If removing the selected question, close the panel
  if (selectedIndex.value === index) {
    isPanelOpen.value = false;
    selectedIndex.value = null;
  } else if (selectedIndex.value !== null && index < selectedIndex.value) {
    // Adjust selected index if removing a question before it
    selectedIndex.value--;
  }
  emit('remove', index);
}

function handleNavigate(direction: 'prev' | 'next') {
  if (selectedIndex.value === null) return;

  if (direction === 'prev' && selectedIndex.value > 0) {
    selectedIndex.value--;
  } else if (direction === 'next' && selectedIndex.value < localQuestions.value.length - 1) {
    selectedIndex.value++;
  }
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
