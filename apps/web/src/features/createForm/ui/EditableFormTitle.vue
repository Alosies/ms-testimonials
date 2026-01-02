<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { Icon } from '@testimonials/icons';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const displayTitle = computed(
  () => props.modelValue || props.placeholder || 'Untitled'
);

async function startEditing() {
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
}

function finishEditing() {
  isEditing.value = false;
  const trimmed = props.modelValue.trim() || props.placeholder || 'Untitled';
  emit('update:modelValue', trimmed);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    finishEditing();
  } else if (event.key === 'Escape') {
    isEditing.value = false;
  }
}
</script>

<template>
  <div class="group flex items-center gap-2">
    <input
      v-if="isEditing"
      ref="inputRef"
      :value="modelValue"
      type="text"
      class="rounded-md border border-gray-300 px-2 py-1 text-2xl font-semibold text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="finishEditing"
      @keydown="handleKeydown"
    />
    <button
      v-else
      type="button"
      class="flex items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-gray-100"
      @click="startEditing"
    >
      <h1 class="text-2xl font-semibold text-gray-900">
        {{ displayTitle }}
      </h1>
      <Icon
        icon="lucide:pencil"
        class="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  </div>
</template>
