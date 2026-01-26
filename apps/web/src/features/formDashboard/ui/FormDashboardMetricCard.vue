<script setup lang="ts">
/**
 * FormDashboardMetricCard
 *
 * Displays a single metric with glassmorphism styling, Lucide icons,
 * and hover effects.
 */

import { type Component } from 'vue';
import { Card } from '@testimonials/ui';

interface Props {
  label: string;
  value: string;
  icon?: Component;
}

defineProps<Props>();
</script>

<template>
  <Card
    class="group relative overflow-hidden p-5 backdrop-blur-sm bg-card/80 border-border/50 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
  >
    <!-- Gradient overlay on hover -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    />

    <!-- Content -->
    <div class="relative">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-muted-foreground">
          {{ label }}
        </span>
        <component
          :is="icon"
          v-if="icon"
          class="h-4 w-4 text-muted-foreground"
        />
      </div>

      <!-- Value -->
      <div class="mt-2">
        <span class="text-2xl font-semibold text-foreground">
          {{ value }}
        </span>
      </div>
    </div>
  </Card>
</template>
