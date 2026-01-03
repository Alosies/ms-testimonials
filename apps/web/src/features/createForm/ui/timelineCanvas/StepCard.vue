<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';

interface Props {
  isSelected: boolean;
  stepNumber: number;
  stepType: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'reorder', direction: 'up' | 'down'): void;
}>();
</script>

<template>
  <div
    class="group relative max-w-lg mx-auto rounded-xl border bg-background shadow-sm transition-all duration-200"
    :class="{
      'ring-2 ring-primary border-primary': isSelected,
      'hover:border-primary/50 hover:shadow-md': !isSelected,
    }"
    @click="emit('select')"
  >
    <!-- Top-right action icons - always visible but faded, full opacity on hover -->
    <div
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
        <Kbd size="sm">⌫</Kbd>
      </button>
    </div>

    <!-- Reorder buttons - left side, faded until hover -->
    <div
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

    <!-- Card content (slot for variants) -->
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>
