<script setup lang="ts">
import { Button } from '@testimonials/ui'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'LandingHero',
})
</script>

<template>
  <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
    <!-- Gradient Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700" />

    <!-- Subtle grid pattern overlay -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwVjBoLTJ2MzRoMnptLTQgMFYwaC0ydjM0aDJ6bS00IDBWMGgtMnYzNGgyem0tNCAwVjBoLTJ2MzRoMnptLTQgMFYwaC0ydjM0aDJ6bS00IDBWMGgtMnYzNGgyem0tNCAwVjBoLTJ2MzRoMnptMjggMHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6bTAtNHYySDZ2LTJoMzB6IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-50" />

    <div class="relative z-10 container mx-auto px-4 py-16 text-center">
      <!-- Beta Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-300" />
        </span>
        Now in Beta - Free to use
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
        <span class="text-amber-300">AI-powered</span> testimonials
        <br />
        <span class="text-teal-200">in 2 minutes</span>
      </h1>

      <!-- Tagline -->
      <p class="text-lg sm:text-xl text-white/90 mb-4 font-medium">
        No complexity tax.
      </p>

      <!-- Description -->
      <p class="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
        AI-powered smart prompts guide your customers through structured questions,
        then assembles their answers into polished, authentic testimonials.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <Button variant="glass" size="lg" as-child class="min-w-[180px] text-base">
          <RouterLink to="/auth/signup">
            Get Started Free
          </RouterLink>
        </Button>
        <Button variant="ghost" size="lg" class="text-white hover:bg-white/10 min-w-[180px] text-base" as-child>
          <RouterLink to="/demo">
            See How It Works
          </RouterLink>
        </Button>
      </div>

      <!-- Social Proof -->
      <div class="flex flex-col items-center gap-3">
        <!-- Avatar Stack -->
        <div class="flex items-center -space-x-3">
          <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
            JD
          </div>
          <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
            MK
          </div>
          <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
            SR
          </div>
          <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
            AL
          </div>
          <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium">
            +
          </div>
        </div>
        <div class="flex items-center gap-2 text-white/80 text-sm">
          <div class="flex">
            <svg v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-300 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>
          <span>Loved by 500+ makers</span>
        </div>
      </div>
    </div>
  </section>
</template>
