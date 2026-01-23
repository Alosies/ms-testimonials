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
            Session
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </th>
          <th class="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
            Events
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
            Last Step
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
            Duration
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
            Started
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Last Activity
          </th>
        </tr>
      </thead>

      <!-- Table Body Skeleton -->
      <tbody class="divide-y divide-border/50">
        <tr v-for="n in (rows ?? 6)" :key="n" class="group">
          <!-- Session ID -->
          <td class="py-3 px-4">
            <Skeleton class="h-4 w-20 font-mono" />
          </td>

          <!-- Status -->
          <td class="py-3 px-4">
            <Skeleton class="h-5 w-20 rounded-full" />
          </td>

          <!-- Events Count -->
          <td class="py-3 px-4 text-center hidden md:table-cell">
            <Skeleton class="h-5 w-8 rounded-full mx-auto" />
          </td>

          <!-- Last Step -->
          <td class="py-3 px-4 hidden lg:table-cell">
            <Skeleton class="h-4 w-16" />
          </td>

          <!-- Duration -->
          <td class="py-3 px-4 hidden md:table-cell">
            <Skeleton class="h-4 w-14" />
          </td>

          <!-- Started -->
          <td class="py-3 px-4 hidden lg:table-cell">
            <Skeleton class="h-4 w-20" />
          </td>

          <!-- Last Activity -->
          <td class="py-3 px-4">
            <Skeleton class="h-4 w-20" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
