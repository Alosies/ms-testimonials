<script setup lang="ts">
import { Icon } from '@testimonials/icons';
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <!-- Decorative Icon Background -->
    <div class="relative mb-6">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl transform rotate-6 scale-110" />
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl transform -rotate-3 scale-105" />
      <div class="relative bg-card rounded-2xl p-6 shadow-sm border">
        <Icon icon="heroicons:inbox" class="h-12 w-12 text-primary" />
      </div>
    </div>

    <h2 class="text-lg font-medium text-foreground mb-2">
      No responses yet
    </h2>
    <p class="text-sm text-muted-foreground text-center max-w-sm">
      When visitors start filling out your form, their sessions will appear here.
    </p>
  </div>
</template>
