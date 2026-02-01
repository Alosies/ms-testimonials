<script setup lang="ts">
import { Skeleton } from '@testimonials/ui';

defineProps<{
  rows?: number;
}>();
</script>

<template>
  <div class="rounded-xl border border-border bg-card overflow-hidden" data-testid="credit-history-skeleton">
    <table class="w-full">
      <!-- Table Header -->
      <thead>
        <tr class="border-b border-border bg-muted/30">
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Date
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Type
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
            Capability
          </th>
          <th class="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Credits
          </th>
          <th class="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
            Balance After
          </th>
        </tr>
      </thead>

      <!-- Table Body Skeleton -->
      <tbody class="divide-y divide-border/50">
        <tr v-for="n in (rows ?? 6)" :key="n" class="group">
          <!-- Date -->
          <td class="py-3 px-4">
            <Skeleton class="h-4 w-28" />
          </td>

          <!-- Type -->
          <td class="py-3 px-4">
            <Skeleton class="h-5 w-24 rounded-full" />
          </td>

          <!-- Capability -->
          <td class="py-3 px-4 hidden md:table-cell">
            <Skeleton class="h-4 w-20" />
          </td>

          <!-- Credits -->
          <td class="py-3 px-4 text-right">
            <Skeleton class="h-4 w-12 ml-auto" />
          </td>

          <!-- Balance After -->
          <td class="py-3 px-4 text-right hidden sm:table-cell">
            <Skeleton class="h-4 w-16 ml-auto" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
