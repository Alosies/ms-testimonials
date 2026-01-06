<script setup lang="ts">
/**
 * Glass-styled skeleton card for question preview during loading.
 */
defineProps<{
  index: number;
  isRevealed: boolean;
}>();
</script>

<template>
  <div
    class="rounded-md border border-gray-100/80 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-500"
    :class="isRevealed ? 'opacity-100 scale-100' : 'opacity-50 scale-[0.98]'"
    :style="{ transitionDelay: `${index * 100}ms` }"
  >
    <div class="flex items-center gap-2.5">
      <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100/80 text-[10px] font-medium text-gray-400">
        {{ index + 1 }}
      </div>
      <div class="flex-1 space-y-1.5">
        <div class="shimmer-bar h-2.5 rounded" :style="{ width: `${65 + (index * 8) % 25}%` }" />
        <div class="shimmer-bar h-1.5 rounded" :style="{ width: `${35 + (index * 10) % 20}%` }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shimmer-bar {
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
