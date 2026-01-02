<script setup lang="ts">
import { Skeleton } from '@testimonials/ui'

defineProps<{
  rows?: number
}>()
</script>

<template>
  <div class="rounded-xl border border-border bg-card overflow-hidden">
    <table class="w-full">
      <!-- Table Header -->
      <thead>
        <tr class="border-b border-border bg-muted/30">
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Form
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
            Product
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Status
          </th>
          <th class="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
            Responses
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
            Updated
          </th>
          <th class="w-36 py-3 px-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>

      <!-- Table Body Skeleton -->
      <tbody class="divide-y divide-border/50">
        <tr v-for="n in (rows ?? 6)" :key="n" class="group">
          <!-- Form Name -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <Skeleton class="w-9 h-9 rounded-lg" />
              <Skeleton class="h-4 w-28" />
            </div>
          </td>

          <!-- Product Name -->
          <td class="py-3 px-4 hidden md:table-cell">
            <Skeleton class="h-4 w-24" />
          </td>

          <!-- Status -->
          <td class="py-3 px-4">
            <div class="flex items-center gap-1.5">
              <Skeleton class="w-2 h-2 rounded-full" />
              <Skeleton class="h-3 w-12" />
            </div>
          </td>

          <!-- Responses -->
          <td class="py-3 px-4 text-center hidden sm:table-cell">
            <Skeleton class="h-5 w-8 rounded-full mx-auto" />
          </td>

          <!-- Updated -->
          <td class="py-3 px-4 hidden lg:table-cell">
            <Skeleton class="h-4 w-16" />
          </td>

          <!-- Actions -->
          <td class="py-3 px-2">
            <div class="flex items-center justify-center gap-1">
              <Skeleton class="w-7 h-7 rounded" />
              <Skeleton class="w-7 h-7 rounded" />
              <Skeleton class="w-7 h-7 rounded" />
              <Skeleton class="w-7 h-7 rounded" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
