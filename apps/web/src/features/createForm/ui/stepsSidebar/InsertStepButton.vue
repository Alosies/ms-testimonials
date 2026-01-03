<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';

interface Props {
  afterIndex: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'insert'): void;
}>();

const isHovered = ref(false);
</script>

<template>
  <div
    class="relative h-6 flex items-center justify-center"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Collapsed state: just a small line -->
    <div
      v-if="!isHovered"
      class="w-0.5 h-full bg-border/50"
    />

    <!-- Expanded state: insert button -->
    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-100"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="isHovered"
        class="absolute flex items-center justify-center w-6 h-6 rounded-full border-2 border-dashed border-primary/50 bg-background hover:border-primary hover:bg-primary/5 transition-colors"
        @click="emit('insert')"
      >
        <Icon icon="heroicons:plus" class="w-3 h-3 text-primary" />
      </button>
    </Transition>
  </div>
</template>
