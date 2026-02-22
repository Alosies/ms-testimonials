<script setup lang="ts">
import { Skeleton } from '@testimonials/ui';

defineProps<{
  rows?: number;
}>();
</script>

<template>
  <div class="rounded-xl border border-border bg-card overflow-hidden">
    <table class="w-full">
      <!-- Table Header -->
      <thead>
        <tr class="border-b border-border bg-muted/30">
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Customer
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
            Content
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
            Rating
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
            Date
          </th>
        </tr>
      </thead>

      <!-- Table Body Skeleton -->
      <tbody class="divide-y divide-border/50">
        <tr v-for="n in (rows ?? 6)" :key="n" class="group">
          <!-- Customer -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <Skeleton class="w-8 h-8 rounded-full" />
              <div class="space-y-1">
                <Skeleton class="h-4 w-24" />
                <Skeleton class="h-3 w-16" />
              </div>
            </div>
          </td>

          <!-- Content -->
          <td class="py-3 px-4 hidden sm:table-cell">
            <Skeleton class="h-4 w-48" />
          </td>

          <!-- Rating -->
          <td class="py-3 px-4 hidden md:table-cell">
            <div class="flex gap-0.5">
              <Skeleton v-for="s in 5" :key="s" class="w-3.5 h-3.5 rounded" />
            </div>
          </td>

          <!-- Status -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-1.5">
              <Skeleton class="w-2 h-2 rounded-full" />
              <Skeleton class="h-3 w-14" />
            </div>
          </td>

          <!-- Date -->
          <td class="py-3 px-4 hidden lg:table-cell">
            <Skeleton class="h-4 w-16" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
