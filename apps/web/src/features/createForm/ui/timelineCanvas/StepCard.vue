<script setup lang="ts">
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

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
    class="max-w-lg mx-auto rounded-xl border bg-background shadow-sm transition-all cursor-pointer"
    :class="{
      'ring-2 ring-primary border-primary': isSelected,
      'hover:border-primary/50 hover:shadow-md': !isSelected,
    }"
    @click="emit('select')"
  >
    <!-- Card content (slot for variants) -->
    <div class="p-6">
      <slot />
    </div>

    <!-- Card footer with actions -->
    <div class="flex items-center justify-between px-4 py-3 border-t bg-muted/30 rounded-b-xl">
      <Button variant="ghost" size="sm" @click.stop="emit('edit')">
        <Icon icon="heroicons:pencil" class="mr-2 h-4 w-4" />
        Edit Content
      </Button>

      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click.stop="emit('reorder', 'up')"
        >
          <Icon icon="heroicons:chevron-up" class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click.stop="emit('reorder', 'down')"
        >
          <Icon icon="heroicons:chevron-down" class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-destructive hover:text-destructive"
          @click.stop="emit('delete')"
        >
          <Icon icon="heroicons:trash" class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
