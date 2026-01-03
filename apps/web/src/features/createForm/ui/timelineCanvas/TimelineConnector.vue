<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@testimonials/icons';

interface Props {
  afterIndex: number;
  showInsert?: boolean;
}

withDefaults(defineProps<Props>(), {
  showInsert: true,
});

const emit = defineEmits<{
  (e: 'insert'): void;
}>();

const isHovered = ref(false);
</script>

<template>
  <div
    class="flex flex-col items-center py-2"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Top line -->
    <div class="w-0.5 h-4 bg-border" />

    <!-- Connection dot / Insert button -->
    <div class="relative">
      <!-- Default dot -->
      <div
        v-if="!isHovered || !showInsert"
        class="w-2 h-2 rounded-full bg-border"
      />

      <!-- Insert button on hover -->
      <Transition
        enter-active-class="transition-all duration-150"
        enter-from-class="opacity-0 scale-75"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-75"
      >
        <button
          v-if="isHovered && showInsert"
          class="absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 border-dashed border-primary/50 bg-background hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-colors"
          @click="emit('insert')"
        >
          <Icon icon="heroicons:plus" class="w-3 h-3 text-primary" />
        </button>
      </Transition>
    </div>

    <!-- Bottom line -->
    <div class="w-0.5 h-4 bg-border" />
  </div>
</template>
