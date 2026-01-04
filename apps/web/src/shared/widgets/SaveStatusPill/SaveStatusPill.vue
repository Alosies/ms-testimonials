<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import type { SaveStatus } from './models';

interface Props {
  /** Current save status */
  status: SaveStatus;
  /** Whether to show keyboard shortcut hint */
  showKeyboardHint?: boolean;
  /** Custom keyboard shortcut to display (default: ⌘S) */
  keyboardHint?: string;
}

withDefaults(defineProps<Props>(), {
  showKeyboardHint: true,
  keyboardHint: '⌘S',
});

const emit = defineEmits<{
  /** Emitted when user clicks to save (only when status is 'unsaved') */
  save: [];
}>();
</script>

<template>
  <!-- Idle: Show nothing -->
  <template v-if="status === 'idle'" />

  <!-- Saved: Green pill with check -->
  <div
    v-else-if="status === 'saved'"
    class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-all"
  >
    <Icon icon="lucide:check" class="h-3 w-3" />
    <span>Saved</span>
  </div>

  <!-- Saving: Amber pill with spinner -->
  <div
    v-else-if="status === 'saving'"
    class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
  >
    <Icon icon="lucide:loader-2" class="h-3 w-3 animate-spin" />
    <span>Saving...</span>
  </div>

  <!-- Unsaved: Amber pill with dot + kbd, clickable -->
  <button
    v-else-if="status === 'unsaved'"
    class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
    @click="emit('save')"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-amber-500" />
    <span>Unsaved</span>
    <kbd
      v-if="showKeyboardHint"
      class="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[10px] text-amber-600"
    >
      {{ keyboardHint }}
    </kbd>
  </button>

  <!-- Error: Red pill with exclamation -->
  <div
    v-else-if="status === 'error'"
    class="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
  >
    <Icon icon="lucide:alert-circle" class="h-3 w-3" />
    <span>Error saving</span>
  </div>
</template>
