<script setup lang="ts">
/**
 * FormSubpageLayout
 *
 * Consistent layout wrapper for form sub-pages.
 * Provides uniform padding, max-width, and background.
 *
 * Used on: responses, analytics, testimonials, widgets, settings
 */
import AuthLayout from '@/layouts/AuthLayout.vue';
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-background">
      <div class="mx-auto max-w-6xl px-6 py-8">
        <slot />
      </div>
    </div>
  </AuthLayout>
</template>
