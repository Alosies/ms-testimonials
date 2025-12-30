<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Button } from '@testimonials/ui';

defineOptions({
  name: 'UnauthLayout',
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b shadow-sm py-4">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <!-- Logo -->
        <RouterLink
          to="/"
          class="flex items-center gap-2"
        >
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg
              class="w-5 h-5 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span class="text-lg font-semibold text-foreground">
            Testimonials
          </span>
          <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">
            AI
          </span>
        </RouterLink>

        <!-- Auth buttons -->
        <div class="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            as-child
          >
            <RouterLink to="/auth/login">
              Log in
            </RouterLink>
          </Button>
          <Button
            size="sm"
            as-child
          >
            <RouterLink to="/auth/signup">
              Get Started
            </RouterLink>
          </Button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow flex items-center justify-center p-4">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white/50 py-6 border-t">
      <div class="container mx-auto px-4">
        <p class="text-center text-muted-foreground text-xs">
          &copy; {{ new Date().getFullYear() }} Testimonials. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
