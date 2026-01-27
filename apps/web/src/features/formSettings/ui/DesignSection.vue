<script setup lang="ts">
/**
 * Design Section - Modern minimal card
 */
import { ref, watch } from 'vue';
import { Icon } from '@testimonials/icons';
import {
  isValidHexColor,
  normalizeHexColor,
  DEFAULT_PRIMARY_COLOR_HEX,
} from '@/entities/form';

interface Props {
  hasCustomColor: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  resetColor: [];
}>();

const primaryColor = defineModel<string>('primaryColor', { required: true });
const localColor = ref(primaryColor.value);

watch(
  () => primaryColor.value,
  (newColor) => {
    localColor.value = newColor;
  },
);

function handleColorChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const newColor = target.value;

  if (isValidHexColor(newColor)) {
    const normalizedColor = normalizeHexColor(newColor);
    localColor.value = normalizedColor;
    primaryColor.value = normalizedColor;
  }
}

function handleReset() {
  primaryColor.value = DEFAULT_PRIMARY_COLOR_HEX;
  emit('resetColor');
}
</script>

<template>
  <div class="group p-5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/50 transition-all">
    <div class="flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <Icon icon="heroicons:paint-brush" class="w-4 h-4 text-muted-foreground" />
          <h3 class="text-sm font-medium text-foreground">Design</h3>
        </div>
        <p class="text-xs text-muted-foreground">
          Accent color for buttons
        </p>
      </div>
      <button
        v-if="hasCustomColor"
        type="button"
        class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
        title="Reset to default"
        @click="handleReset"
      >
        <Icon icon="heroicons:arrow-path" class="w-4 h-4" />
      </button>
    </div>

    <div class="mt-4 flex items-center gap-3">
      <label class="relative cursor-pointer group/picker">
        <div
          class="w-12 h-12 rounded-xl shadow-sm ring-1 ring-black/5 transition-transform group-hover/picker:scale-105"
          :style="{ backgroundColor: localColor }"
        />
        <input
          type="color"
          :value="localColor"
          class="absolute inset-0 opacity-0 cursor-pointer"
          @input="handleColorChange"
        />
      </label>
      <div>
        <span class="text-sm font-mono text-foreground">{{ localColor.toUpperCase() }}</span>
        <p class="text-xs text-muted-foreground">Click to change</p>
      </div>
    </div>
  </div>
</template>
