<script setup lang="ts">
import { Button } from '@testimonials/ui'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'LandingCta',
})
</script>

<template>
  <section class="relative py-24 overflow-hidden">
    <!-- Gradient Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600" />

    <!-- Subtle pattern overlay -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwVjBoLTJ2MzRoMnptLTQgMFYwaC0ydjM0aDJ6bS00IDBWMGgtMnYzNGgyem0tNCAwVjBoLTJ2MzRoMnptLTQgMFYwaC0ydjM0aDJ6bS00IDBWMGgtMnYzNGgyem0tNCAwVjBoLTJ2MzRoMnptMjggMHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />

    <div class="relative z-10 container mx-auto px-4 text-center">
      <h2 class="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
        Ready to collect better testimonials?
      </h2>
      <p class="text-lg text-white/90 max-w-xl mx-auto mb-8">
        Join 500+ makers who use AI-powered smart prompts to get testimonials that convert.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="glass" size="lg" as-child class="min-w-[200px] text-base">
          <RouterLink to="/signup">
            Get Started Free
          </RouterLink>
        </Button>
        <p class="text-white/70 text-sm">
          No credit card required
        </p>
      </div>
    </div>
  </section>
</template>
