<script setup lang="ts">
import { Skeleton } from '@testimonials/ui';
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div v-for="i in 3" :key="i" class="rounded-lg border border-border bg-card p-5">
      <div class="flex items-start gap-3 mb-3">
        <Skeleton class="h-10 w-10 rounded-lg" />
        <div class="space-y-2 flex-1">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="h-3 w-20" />
        </div>
      </div>
      <div class="flex gap-2">
        <Skeleton class="h-5 w-20 rounded-full" />
        <Skeleton class="h-5 w-12 rounded-full" />
      </div>
    </div>
  </div>
</template>
