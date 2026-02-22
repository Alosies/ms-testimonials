<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import { testimonialsTestIds } from '@/shared/constants/testIds';
import TestimonialsTableRow from './TestimonialsTableRow.vue';
import type { TestimonialWithFormItem } from '@/entities/testimonial';
import type { SortColumn, SortDirection } from '../models';

const props = defineProps<{
  testimonials: TestimonialWithFormItem[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  selectedId: string | null;
  showFormAttribution?: boolean;
}>();

const emit = defineEmits<{
  sort: [column: SortColumn];
  select: [id: string];
}>();

const getSortIcon = (column: SortColumn): string => {
  if (props.sortColumn === column) {
    return props.sortDirection === 'asc' ? 'heroicons:chevron-up' : 'heroicons:chevron-down';
  }
  return 'heroicons:chevron-up-down';
};

const isSortedBy = (column: SortColumn): boolean => props.sortColumn === column;
</script>

<template>
  <div :data-testid="testimonialsTestIds.testimonialsTable" class="rounded-xl border border-border bg-card overflow-hidden">
    <table class="w-full">
      <!-- Table Header -->
      <thead>
        <tr class="border-b border-border bg-muted/30">
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'customer')"
          >
            <div class="flex items-center gap-1">
              Customer
              <Icon :icon="getSortIcon('customer')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('customer') }" />
            </div>
          </th>
          <th class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
            Content
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'rating')"
          >
            <div class="flex items-center gap-1">
              Rating
              <Icon :icon="getSortIcon('rating')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('rating') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'status')"
          >
            <div class="flex items-center gap-1">
              Status
              <Icon :icon="getSortIcon('status')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('status') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'date')"
          >
            <div class="flex items-center gap-1">
              Date
              <Icon :icon="getSortIcon('date')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('date') }" />
            </div>
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody class="divide-y divide-border/50">
        <TestimonialsTableRow
          v-for="t in testimonials"
          :key="t.id"
          :testimonial="t"
          :is-selected="t.id === selectedId"
          :show-form-attribution="showFormAttribution"
          @select="emit('select', $event)"
        />
      </tbody>
    </table>
  </div>
</template>
