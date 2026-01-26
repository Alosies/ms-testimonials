<script setup lang="ts">
/**
 * FormDashboardEmpty
 *
 * Empty state when no analytics data exists.
 * Share actions are shown in the Form Dashboard page header.
 */

import { BarChart3 } from 'lucide-vue-next';
import { Card } from '@testimonials/ui';
</script>

<template>
  <Card class="p-8 text-center backdrop-blur-sm bg-card/80 border-border/50">
    <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
      <BarChart3 class="h-8 w-8 text-muted-foreground" />
    </div>

    <h3 class="mb-2 text-lg font-medium text-foreground">
      No analytics data yet
    </h3>

    <p class="text-muted-foreground">
      Share your form to start collecting insights.
    </p>
  </Card>
</template>
