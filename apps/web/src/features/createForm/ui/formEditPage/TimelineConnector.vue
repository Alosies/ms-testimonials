<script setup lang="ts">
/**
 * Timeline Connector - Interactive connector between timeline steps
 *
 * Displays a vertical connector line with an insert button that appears on hover.
 * Clicking the insert button opens a step type picker.
 */
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';
import type { StepType } from '../../models/stepContent';
import StepTypePicker from '../stepsSidebar/StepTypePicker.vue';

const emit = defineEmits<{
  insert: [type: StepType];
}>();

const isHovered = ref(false);
const pickerOpen = ref(false);

function handleSelectType(type: StepType) {
  emit('insert', type);
  pickerOpen.value = false;
}
</script>

<template>
  <div
    class="timeline-connector"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="connector-line-top" />

    <!-- Insert button with picker - appears on hover -->
    <StepTypePicker
      v-model:open="pickerOpen"
      @select="handleSelectType"
    >
      <button
        v-show="isHovered || pickerOpen"
        class="insert-button"
        title="Insert step here"
      >
        <Icon icon="heroicons:plus" class="w-3.5 h-3.5" />
      </button>
    </StepTypePicker>

    <!-- Default dot when not hovered and picker not open -->
    <div v-if="!isHovered && !pickerOpen" class="connector-dot" />

    <div class="connector-line-bottom" />
  </div>
</template>

<style scoped>
.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
}

.connector-line-top,
.connector-line-bottom {
  width: 2px;
  height: 2.5rem;
  background: linear-gradient(
    to bottom,
    hsl(var(--border)),
    hsl(var(--muted-foreground) / 0.3)
  );
  border-radius: 1px;
}

.connector-line-bottom {
  background: linear-gradient(
    to bottom,
    hsl(var(--muted-foreground) / 0.3),
    hsl(var(--border))
  );
}

.connector-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: hsl(var(--muted-foreground) / 0.3);
  margin: 0.25rem 0;
}

.insert-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: 2px dashed hsl(var(--primary) / 0.5);
  background: hsl(var(--background));
  color: hsl(var(--primary));
  margin: 0.125rem 0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.insert-button:hover {
  border-color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  transform: scale(1.1);
}
</style>
