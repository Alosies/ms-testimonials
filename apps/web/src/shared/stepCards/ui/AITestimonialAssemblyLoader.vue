<script setup lang="ts">
/**
 * AI Testimonial Assembly Loader — animated progress indicator shown while
 * the AI assembles a testimonial from the user's answers.
 */
import { ref, onUnmounted } from 'vue';
import { Icon } from '@testimonials/icons';

const steps = [
  'Analyzing your answers',
  'Identifying key themes',
  'Crafting your story',
  'Polishing the final draft',
] as const;

const activeIndex = ref(0);

const timer = setInterval(() => {
  if (activeIndex.value < steps.length - 1) {
    activeIndex.value++;
  }
}, 2000);

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div class="h-full w-full flex flex-col items-center text-center gap-6">
    <!-- Top: icon + heading + dots -->
    <div class="flex flex-col items-center">
      <div class="pulse-glow relative flex items-center justify-center w-14 h-14 mb-2">
        <Icon
          icon="lucide:sparkles"
          class="w-8 h-8 text-primary relative z-10"
        />
      </div>

      <h3 class="text-2xl font-semibold text-gray-900 mb-0.5">
        Crafting your testimonial
      </h3>

      <div class="flex items-center justify-center gap-1.5 h-5">
        <span
          v-for="i in 3"
          :key="i"
          class="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        />
      </div>
    </div>

    <!-- Middle: testimonial text skeleton preview -->
    <div class="w-full max-w-md rounded-xl border border-gray-100 bg-gray-50/60 p-6 flex flex-col gap-5">
      <!-- Quote icon -->
      <Icon
        icon="lucide:quote"
        class="w-6 h-6 text-primary/20"
      />

      <!-- Skeleton text lines with shimmer -->
      <div class="flex flex-col gap-2.5">
        <div class="skeleton-line h-3 w-full rounded-full bg-gray-200/70" />
        <div class="skeleton-line h-3 w-11/12 rounded-full bg-gray-200/70" style="animation-delay: 0.15s" />
        <div class="skeleton-line h-3 w-4/5 rounded-full bg-gray-200/70" style="animation-delay: 0.3s" />
        <div class="skeleton-line h-3 w-full rounded-full bg-gray-200/70" style="animation-delay: 0.45s" />
        <div class="skeleton-line h-3 w-3/4 rounded-full bg-gray-200/70" style="animation-delay: 0.6s" />
      </div>

      <!-- Skeleton avatar + name -->
      <div class="flex items-center gap-3 pt-1">
        <div class="skeleton-line h-8 w-8 shrink-0 rounded-full bg-gray-200/70" style="animation-delay: 0.75s" />
        <div class="flex flex-col gap-1.5">
          <div class="skeleton-line h-2.5 w-24 rounded-full bg-gray-200/70" style="animation-delay: 0.8s" />
          <div class="skeleton-line h-2 w-16 rounded-full bg-gray-200/70" style="animation-delay: 0.9s" />
        </div>
      </div>
    </div>

    <!-- Bottom: progress bar + steps -->
    <div class="w-full max-w-sm flex flex-col items-center gap-5">
      <!-- Progress steps -->
      <ul class="flex flex-col items-start gap-3 text-sm">
        <li
          v-for="(label, i) in steps"
          :key="i"
          class="flex items-center gap-3 transition-colors duration-300"
          :class="i <= activeIndex ? 'text-gray-900' : 'text-gray-400'"
        >
          <Icon
            v-if="i < activeIndex"
            icon="lucide:check-circle-2"
            class="w-5 h-5 text-green-500"
          />
          <span
            v-else-if="i === activeIndex"
            class="relative flex h-5 w-5 items-center justify-center"
          >
            <span class="absolute h-3.5 w-3.5 animate-ping rounded-full bg-primary/40" />
            <span class="relative h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span
            v-else
            class="flex h-5 w-5 items-center justify-center"
          >
            <span class="h-2 w-2 rounded-full bg-gray-300" />
          </span>

          {{ label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.pulse-glow {
  animation: pulse-glow 2.5s ease-in-out infinite;
}

.pulse-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: var(--color-primary);
  opacity: 0.1;
  animation: glow-ring 2.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.85; }
}

@keyframes glow-ring {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.6); opacity: 0; }
}

.typing-dot {
  animation: typing 1.4s ease-in-out infinite;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.skeleton-line {
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 0.5) 25%,
    rgba(243, 244, 246, 0.8) 50%,
    rgba(229, 231, 235, 0.5) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 2s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
