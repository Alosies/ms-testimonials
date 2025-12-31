<script setup lang="ts">
import { ref, watch } from 'vue';
import type { QuestionData } from '../models';
import QuestionCard from './QuestionCard.vue';

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

// Drag state
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

// Keep local copy in sync with props
watch(
  () => props.questions,
  (newQuestions) => {
    localQuestions.value = [...newQuestions];
  },
  { deep: true }
);

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
  }

  draggedIndex.value = null;
  dragOverIndex.value = null;
}

function onDragEnd() {
  draggedIndex.value = null;
  dragOverIndex.value = null;
}
</script>

<template>
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
        @update="(i, updates) => emit('update', i, updates)"
        @remove="(i) => emit('remove', i)"
      />
    </div>

    <div
      v-if="localQuestions.length === 0"
      class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
    >
      <p class="text-gray-500">No questions yet. Add a custom question below.</p>
    </div>
  </div>
</template>
