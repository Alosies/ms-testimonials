<script setup lang="ts">
import { Icon } from '@testimonials/icons'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@testimonials/ui'
import type { FormItem } from '../models'

defineProps<{
  form: FormItem
}>()

const emit = defineEmits<{
  view: []
  edit: []
  viewResponses: []
  openSettings: []
  delete: []
}>()

const getStatusConfig = (form: FormItem) => {
  if (form.status === 'draft') {
    return { label: 'Draft', dotClass: 'bg-amber-500', textClass: 'text-amber-600' }
  }
  return { label: 'Published', dotClass: 'bg-emerald-500', textClass: 'text-emerald-600' }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <tr
    class="group transition-colors hover:bg-muted/30 cursor-pointer"
    @click="emit('view')"
  >
    <!-- Form Name -->
    <td class="py-3 px-4">
      <div class="flex items-center gap-3">
        <div
          class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
          :class="[
            form.status === 'draft'
              ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600'
              : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary'
          ]"
        >
          <Icon icon="heroicons:document-text" class="h-4 w-4" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
            {{ form.name }}
          </p>
          <p v-if="form.product_name" class="text-xs text-muted-foreground truncate max-w-[180px] md:hidden">
            {{ form.product_name }}
          </p>
        </div>
      </div>
    </td>

    <!-- Product Name -->
    <td class="py-3 px-4 hidden md:table-cell">
      <p class="text-sm text-muted-foreground truncate max-w-[150px]">
        {{ form.product_name || '—' }}
      </p>
    </td>

    <!-- Status -->
    <td class="py-3 px-4">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full" :class="getStatusConfig(form).dotClass" />
        <span class="text-xs font-medium" :class="getStatusConfig(form).textClass">
          {{ getStatusConfig(form).label }}
        </span>
      </div>
    </td>

    <!-- Responses Count -->
    <td class="py-3 px-4 text-center hidden sm:table-cell">
      <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
        0
      </span>
    </td>

    <!-- Last Updated -->
    <td class="py-3 px-4 hidden lg:table-cell">
      <p class="text-sm text-muted-foreground">
        {{ formatDate(form.updated_at) }}
      </p>
    </td>

    <!-- Actions -->
    <td class="py-3 px-2" @click.stop>
      <div class="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
          title="Open Studio"
          @click="emit('edit')"
        >
          <Icon icon="heroicons:paint-brush" class="h-4 w-4 text-muted-foreground" />
          <span class="sr-only">Open Studio</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
          title="View responses"
          @click="emit('viewResponses')"
        >
          <Icon icon="heroicons:inbox" class="h-4 w-4 text-muted-foreground" />
          <span class="sr-only">View responses</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
          title="Form settings"
          @click="emit('openSettings')"
        >
          <Icon icon="heroicons:cog-6-tooth" class="h-4 w-4 text-muted-foreground" />
          <span class="sr-only">Form settings</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              variant="ghost"
              size="icon-sm"
              class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
              title="More actions"
            >
              <Icon icon="heroicons:ellipsis-vertical" class="h-4 w-4 text-muted-foreground" />
              <span class="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <DropdownMenuItem @click="emit('view')" class="gap-2">
              <Icon icon="heroicons:eye" class="h-4 w-4" />
              View Form
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2">
              <Icon icon="heroicons:document-duplicate" class="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem class="gap-2">
              <Icon icon="heroicons:link" class="h-4 w-4" />
              Copy Link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="gap-2 text-destructive focus:text-destructive" @click="emit('delete')">
              <Icon icon="heroicons:trash" class="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </td>
  </tr>
</template>
