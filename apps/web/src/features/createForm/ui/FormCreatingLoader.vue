<script setup lang="ts">
/**
 * Full-screen loader shown while creating a new form.
 * Displays a polished "Bootstrapping your new form" animation
 * while the form is being created in the background.
 */
import { Icon } from '@testimonials/icons';
import GlassmorphicBackground from './aiLoader/childComponents/GlassmorphicBackground.vue';

defineProps<{
  error?: string | null;
}>();

defineEmits<{
  retry: [];
}>();

const stages = [
  { icon: 'lucide:wand-2', text: 'Initializing AI form builder' },
  { icon: 'lucide:brain', text: 'Loading smart question engine' },
  { icon: 'lucide:sparkles', text: 'Preparing your canvas' },
];
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Animated gradient background -->
    <GlassmorphicBackground />

    <!-- Main glass container -->
    <div class="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <!-- Inner glow -->
      <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5" />

      <div class="relative z-10">
        <!-- Error state -->
        <template v-if="error">
          <div class="flex flex-col items-center text-center">
            <!-- Error icon -->
            <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25">
              <Icon icon="lucide:alert-circle" class="h-8 w-8 text-white" />
            </div>

            <h2 class="mb-2 text-xl font-semibold text-gray-900">Something went wrong</h2>
            <p class="mb-6 text-sm text-gray-500">{{ error }}</p>

            <button
              class="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-teal-500/25 transition-all hover:bg-teal-700 hover:shadow-lg"
              @click="$emit('retry')"
            >
              Try Again
            </button>
          </div>
        </template>

        <!-- Loading state -->
        <template v-else>
          <div class="flex flex-col items-center text-center">
            <!-- Animated icon -->
            <div class="relative mb-6">
              <!-- Orbital ring -->
              <div class="absolute -inset-4 animate-spin-slow rounded-full border border-dashed border-teal-400/40" />
              <!-- Pulse rings -->
              <div class="absolute -inset-2 animate-ping-slow rounded-full bg-teal-500/20" />
              <div class="absolute -inset-3 animate-ping-slower rounded-full bg-teal-500/10 [animation-delay:0.5s]" />

              <!-- Icon box -->
              <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
                <!-- Sparkles -->
                <div class="absolute -right-1 -top-1 h-1.5 w-1.5 animate-sparkle rounded-full bg-white" />
                <div class="absolute -bottom-1 -left-1 h-1 w-1 animate-sparkle rounded-full bg-teal-300 [animation-delay:0.5s]" />

                <Icon icon="lucide:wand-sparkles" class="h-8 w-8 text-white" />
              </div>
            </div>

            <!-- Main heading -->
            <h2 class="mb-2 text-xl font-semibold text-gray-900">
              Bootstrapping your new form
            </h2>
            <p class="mb-8 text-sm text-gray-500">
              Setting up everything for a great experience
            </p>

            <!-- Stage indicators -->
            <div class="w-full space-y-3">
              <div
                v-for="(stage, index) in stages"
                :key="index"
                class="flex items-center gap-3 rounded-lg bg-white/50 px-4 py-3 backdrop-blur-sm"
                :class="{ 'animate-pulse': index === 1 }"
                :style="{ animationDelay: `${index * 0.3}s` }"
              >
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg"
                  :class="index <= 1 ? 'bg-teal-500/10 text-teal-600' : 'bg-gray-100 text-gray-400'"
                >
                  <Icon :icon="stage.icon" class="h-4 w-4" />
                </div>
                <span
                  class="text-sm font-medium"
                  :class="index <= 1 ? 'text-gray-700' : 'text-gray-400'"
                >
                  {{ stage.text }}
                </span>
                <Icon
                  v-if="index === 0"
                  icon="lucide:check"
                  class="ml-auto h-4 w-4 text-teal-500"
                />
                <div
                  v-else-if="index === 1"
                  class="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
