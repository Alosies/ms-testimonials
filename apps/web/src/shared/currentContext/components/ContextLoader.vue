<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const loadingMessages = [
  'Loading your workspace...',
  'Fetching organization data...',
  'Almost ready...',
];

const currentMessage = ref(loadingMessages[0]);
let currentMessageIndex = 0;
let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  interval = setInterval(() => {
    currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length;
    currentMessage.value = loadingMessages[currentMessageIndex];
  }, 1500);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-white">
    <div class="flex flex-col items-center gap-4">
      <!-- Animated spinner -->
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      <!-- Loading message with transition -->
      <p class="text-sm text-gray-500 transition-opacity duration-300">
        {{ currentMessage }}
      </p>
    </div>
  </div>
</template>
