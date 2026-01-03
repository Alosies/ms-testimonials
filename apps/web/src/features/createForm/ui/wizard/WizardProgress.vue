<script setup lang="ts">
/**
 * Wizard Progress Indicator
 *
 * Shows the current step in the wizard with dots.
 */

defineProps<{
  currentScreen: number;
  totalScreens: number;
}>();
</script>

<template>
  <div class="flex items-center gap-2">
    <template v-for="step in totalScreens" :key="step">
      <!-- Step dot -->
      <div
        class="h-2.5 rounded-full transition-all duration-300"
        :class="[
          step === currentScreen
            ? 'w-8 bg-teal-500'
            : step < currentScreen
              ? 'w-2.5 bg-teal-500'
              : 'w-2.5 bg-gray-300'
        ]"
      />
    </template>
  </div>
</template>
