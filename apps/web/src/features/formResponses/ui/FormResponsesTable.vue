<script setup lang="ts">
import { Icon } from '@testimonials/icons';
import FormResponsesTableRow from './FormResponsesTableRow.vue';
import type { AggregatedSession, SortColumn, SortDirection } from '../models';

const props = defineProps<{
  sessions: AggregatedSession[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  selectedSessionId?: string | null;
}>();

const emit = defineEmits<{
  sort: [column: SortColumn];
  selectSession: [session: AggregatedSession];
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
  <div class="rounded-xl border border-border bg-card overflow-hidden">
    <table class="w-full">
      <!-- Table Header -->
      <thead>
        <tr class="border-b border-border bg-muted/30">
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'session')"
          >
            <div class="flex items-center gap-1">
              Session
              <Icon :icon="getSortIcon('session')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('session') }" />
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
            class="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'events')"
          >
            <div class="flex items-center justify-center gap-1">
              Events
              <Icon :icon="getSortIcon('events')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('events') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'lastStep')"
          >
            <div class="flex items-center gap-1">
              Last Step
              <Icon :icon="getSortIcon('lastStep')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('lastStep') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'duration')"
          >
            <div class="flex items-center gap-1">
              Duration
              <Icon :icon="getSortIcon('duration')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('duration') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'started')"
          >
            <div class="flex items-center gap-1">
              Started
              <Icon :icon="getSortIcon('started')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('started') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'lastActivity')"
          >
            <div class="flex items-center gap-1">
              Last Activity
              <Icon :icon="getSortIcon('lastActivity')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('lastActivity') }" />
            </div>
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody class="divide-y divide-border/50">
        <FormResponsesTableRow
          v-for="session in sessions"
          :key="session.sessionId"
          :session="session"
          :is-selected="selectedSessionId === session.sessionId"
          @select="emit('selectSession', session)"
        />
      </tbody>
    </table>
  </div>
</template>
