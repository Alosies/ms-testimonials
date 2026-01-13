<script setup lang="ts">
import { Icon } from '@testimonials/icons'
import FormsTableRow from './FormsTableRow.vue'
import type { FormItem, SortColumn, SortDirection } from '../models'
import { formsTestIds } from '@/shared/constants/testIds'

const props = defineProps<{
  forms: FormItem[]
  sortColumn: SortColumn
  sortDirection: SortDirection
}>()

const emit = defineEmits<{
  sort: [column: SortColumn]
  viewForm: [form: FormItem]
  editForm: [form: FormItem]
  viewResponses: [form: FormItem]
  openSettings: [form: FormItem]
  deleteForm: [form: FormItem]
}>()

const getSortIcon = (column: SortColumn): string => {
  if (props.sortColumn === column) {
    return props.sortDirection === 'asc' ? 'heroicons:chevron-up' : 'heroicons:chevron-down'
  }
  return 'heroicons:chevron-up-down'
}

const isSortedBy = (column: SortColumn): boolean => props.sortColumn === column
</script>

<template>
  <div :data-testid="formsTestIds.formsList" class="rounded-xl border border-border bg-card overflow-hidden">
    <table class="w-full">
      <!-- Table Header -->
      <thead>
        <tr class="border-b border-border bg-muted/30">
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'name')"
          >
            <div class="flex items-center gap-1">
              Form
              <Icon :icon="getSortIcon('name')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('name') }" />
            </div>
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'product')"
          >
            <div class="flex items-center gap-1">
              Product
              <Icon :icon="getSortIcon('product')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('product') }" />
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
          <th class="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
            Responses
          </th>
          <th
            class="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-foreground transition-colors select-none"
            @click="emit('sort', 'updated')"
          >
            <div class="flex items-center gap-1">
              Updated
              <Icon :icon="getSortIcon('updated')" class="h-3 w-3" :class="{ 'opacity-40': !isSortedBy('updated') }" />
            </div>
          </th>
          <th class="w-36 py-3 px-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody class="divide-y divide-border/50">
        <FormsTableRow
          v-for="form in forms"
          :key="form.id"
          :form="form"
          @view="emit('viewForm', form)"
          @edit="emit('editForm', form)"
          @view-responses="emit('viewResponses', form)"
          @open-settings="emit('openSettings', form)"
          @delete="emit('deleteForm', form)"
        />
      </tbody>
    </table>
  </div>
</template>
