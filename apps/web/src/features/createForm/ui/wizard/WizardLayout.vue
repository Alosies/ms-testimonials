<script setup lang="ts">
/**
 * Wizard Layout
 *
 * Provides consistent layout for all wizard screens with
 * centered content and progress indicator.
 */
import { onMounted, onUnmounted } from 'vue';
import { Kbd } from '@testimonials/ui';
import type { WizardScreen } from '../../composables/useFormWizard';
import WizardProgress from './WizardProgress.vue';

defineProps<{
  currentScreen: WizardScreen;
}>();

const emit = defineEmits<{
  escape: [];
}>();

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('escape');
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div
    class="flex min-h-screen flex-col"
    :class="currentScreen === 4 ? 'bg-transparent' : 'bg-gradient-to-br from-gray-50 to-gray-100'"
  >
    <!-- Escape hint -->
    <button
      class="absolute left-4 top-4 z-50 flex items-center gap-2 text-sm transition-colors"
      :class="currentScreen === 4 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-600'"
      @click="emit('escape')"
    >
      <Kbd>Esc</Kbd>
      <span>to exit</span>
    </button>

    <!-- Progress indicator (hidden on generating/preview screens) -->
    <div
      v-if="currentScreen <= 3"
      class="flex justify-center pt-8"
    >
      <WizardProgress :current-screen="currentScreen" :total-screens="3" />
    </div>

    <!-- Main content area -->
    <div
      class="flex flex-1 items-center justify-center"
      :class="currentScreen === 4 ? 'px-0 py-0' : 'px-4 py-8'"
    >
      <div
        class="w-full"
        :class="currentScreen === 4 ? 'h-full' : 'max-w-xl'"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
