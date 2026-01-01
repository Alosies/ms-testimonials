<script setup lang="ts">
/**
 * Glassmorphic animated background with aurora, blobs, and floating orbs.
 * Provides a vibrant gradient backdrop for glass effects.
 */

// Generate floating orbs with random properties
const orbs = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 60 + 40,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
  hue: Math.random() > 0.5 ? 'teal' : 'purple',
}));
</script>

<template>
  <div class="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-purple-50">
    <!-- Subtle teal/purple gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-teal-100/50 via-transparent to-purple-100/40" />

    <!-- Aurora sweep -->
    <div class="absolute inset-0 animate-aurora opacity-40">
      <div class="absolute inset-0 bg-gradient-to-r from-teal-300/0 via-teal-200/30 to-purple-300/0" />
    </div>

    <!-- Morphing blobs - soft pastels -->
    <div class="absolute inset-0">
      <div class="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 animate-blob rounded-full bg-teal-200/40 blur-3xl" />
      <div class="absolute -right-1/4 -top-1/4 h-1/2 w-1/2 animate-blob rounded-full bg-purple-200/30 blur-3xl [animation-delay:2s]" />
      <div class="absolute -bottom-1/4 left-1/4 h-1/2 w-1/2 animate-blob rounded-full bg-cyan-200/30 blur-3xl [animation-delay:4s]" />
    </div>

    <!-- Floating orbs - soft -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="orb in orbs"
        :key="orb.id"
        class="absolute animate-float-orb rounded-full blur-xl"
        :class="orb.hue === 'teal' ? 'bg-teal-300/30' : 'bg-purple-300/25'"
        :style="{
          width: `${orb.size}px`,
          height: `${orb.size}px`,
          left: `${orb.x}%`,
          top: `${orb.y}%`,
          animationDuration: `${orb.duration}s`,
          animationDelay: `${orb.delay}s`,
        }"
      />
    </div>
  </div>
</template>
