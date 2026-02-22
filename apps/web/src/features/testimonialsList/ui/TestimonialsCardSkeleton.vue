<script setup lang="ts">
import { Skeleton } from '@testimonials/ui';
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="i in 3"
      :key="i"
      class="rounded-xl border border-border bg-card p-4 space-y-3"
    >
      <!-- Rating + status row -->
      <div class="flex items-center justify-between">
        <Skeleton class="h-4 w-20" />
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
      <!-- Content lines -->
      <div class="space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-3/4" />
      </div>
      <!-- Customer info -->
      <div class="flex items-center gap-3 pt-1">
        <Skeleton class="h-8 w-8 rounded-full" />
        <div class="space-y-1">
          <Skeleton class="h-3.5 w-28" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
    </div>
  </div>
</template>
