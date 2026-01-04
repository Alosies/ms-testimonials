<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import type { StepCardMode } from '../models';

interface Props {
  /** Display mode - 'edit' shows action buttons, 'preview' is read-only */
  mode: StepCardMode;
  /** Whether this step is currently selected (edit mode only) */
  isSelected?: boolean;
  /** Step type identifier */
  stepType: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'preview',
  isSelected: false,
});

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'reorder', direction: 'up' | 'down'): void;
}>();

const isEditMode = computed(() => props.mode === 'edit');
</script>

<template>
  <div
    class="relative max-w-lg mx-auto rounded-xl border bg-background shadow-sm transition-all duration-200"
    :class="{
      'group': isEditMode,
      'ring-2 ring-primary border-primary': isEditMode && isSelected,
      'hover:border-primary/50 hover:shadow-md cursor-pointer': isEditMode && !isSelected,
    }"
    @click="isEditMode && emit('select')"
  >
    <!-- Edit mode: Top-right action icons -->
    <div
      v-if="isEditMode"
      class="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-lg bg-background/90 backdrop-blur-sm px-2 py-1.5 shadow-sm border border-border/50 opacity-40 group-hover:opacity-100 transition-opacity duration-200"
    >
      <button
        class="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors"
        title="Edit step"
        @click.stop="emit('edit')"
      >
        <Icon icon="heroicons:pencil" class="h-4 w-4 text-muted-foreground" />
        <Kbd size="sm">E</Kbd>
      </button>
      <button
        class="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-destructive/10 transition-colors"
        title="Delete step"
        @click.stop="emit('delete')"
      >
        <Icon icon="heroicons:trash" class="h-4 w-4 text-muted-foreground hover:text-destructive" />
        <Kbd size="sm">Del</Kbd>
      </button>
    </div>

    <!-- Edit mode: Reorder buttons on left side -->
    <div
      v-if="isEditMode"
      class="absolute top-1/2 -translate-y-1/2 -left-10 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <button
        class="p-1 rounded hover:bg-muted transition-colors"
        title="Move up"
        @click.stop="emit('reorder', 'up')"
      >
        <Icon icon="heroicons:chevron-up" class="h-4 w-4 text-muted-foreground" />
      </button>
      <button
        class="p-1 rounded hover:bg-muted transition-colors"
        title="Move down"
        @click.stop="emit('reorder', 'down')"
      >
        <Icon icon="heroicons:chevron-down" class="h-4 w-4 text-muted-foreground" />
      </button>
    </div>

    <!-- Card content -->
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>
