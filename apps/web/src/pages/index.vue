<script setup lang="ts">
import { Button } from '@testimonials/ui'
import { RouterLink } from 'vue-router'

defineOptions({
  name: 'HomePage',
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-foreground mb-4">
        Testimonials
      </h1>
      <p class="text-lg text-muted-foreground mb-8">
        Beautiful testimonials in 2 minutes. No complexity tax.
      </p>
      <Button as-child>
        <RouterLink to="/showcase">View Component Showcase</RouterLink>
      </Button>
    </div>
  </div>
</template>
