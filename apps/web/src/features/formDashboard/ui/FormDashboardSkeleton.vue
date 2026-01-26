<script setup lang="ts">
/**
 * FormDashboardSkeleton
 *
 * Loading skeleton for the dashboard matching the actual layout:
 * 1. Metrics row (5 cards)
 * 2. Audience (Device + Location) & Ratings (2-column on lg)
 */

import { Card, Skeleton } from '@testimonials/ui';
</script>

<template>
  <div class="space-y-6">
    <!-- Metrics skeleton (5 cards) -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Card
        v-for="i in 5"
        :key="`metric-${i}`"
        class="p-5 backdrop-blur-sm bg-card/80 border-border/50"
      >
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-4 w-4 rounded" />
        </div>
        <Skeleton class="mt-2 h-8 w-16" />
      </Card>
    </div>

    <!-- Audience & Ratings skeleton (matches lg:grid-cols-2 layout) -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Audience section (Device + Location) -->
      <div class="grid gap-4 md:grid-cols-2">
        <!-- Device skeleton -->
        <Card class="p-5 backdrop-blur-sm bg-card/80 border-border/50">
          <Skeleton class="mb-4 h-6 w-16" />
          <div class="flex justify-center">
            <Skeleton class="h-40 w-40 rounded-full" />
          </div>
          <div class="mt-4 flex justify-center gap-6">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-4 w-24" />
          </div>
        </Card>

        <!-- Location skeleton -->
        <Card class="p-5 backdrop-blur-sm bg-card/80 border-border/50">
          <Skeleton class="mb-4 h-6 w-20" />
          <div class="space-y-2">
            <div v-for="j in 5" :key="`location-${j}`" class="flex justify-between">
              <div class="flex items-center gap-2">
                <Skeleton class="h-5 w-5 rounded" />
                <Skeleton class="h-4 w-20" />
              </div>
              <Skeleton class="h-4 w-10" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Ratings skeleton -->
      <Card class="p-5 backdrop-blur-sm bg-card/80 border-border/50">
        <Skeleton class="mb-4 h-6 w-16" />
        <!-- Stars -->
        <div class="flex justify-center gap-0.5">
          <Skeleton v-for="s in 5" :key="`star-${s}`" class="h-6 w-6 rounded" />
        </div>
        <!-- Rating value -->
        <div class="mt-2 flex flex-col items-center gap-1">
          <Skeleton class="h-8 w-12" />
          <Skeleton class="h-4 w-32" />
        </div>
        <!-- Distribution bars -->
        <div class="mt-4 space-y-2">
          <div v-for="r in 5" :key="`rating-${r}`" class="flex items-center gap-2">
            <Skeleton class="h-4 w-8" />
            <Skeleton class="h-4 flex-1 rounded" />
            <Skeleton class="h-4 w-8" />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
