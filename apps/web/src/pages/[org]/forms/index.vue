<script setup lang="ts">
/**
 * Forms list page
 * Route: /:org/forms
 *
 * Displays all forms for the current organization with:
 * - Create new form action
 * - Form table with status, responses count, and quick actions
 * - Loading and empty states
 */
import { computed, toRefs } from 'vue'
import { definePage } from 'unplugin-vue-router/runtime'
import { Icon } from '@testimonials/icons'
import {
  Button,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@testimonials/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useGetForms } from '@/entities/form'
import { useCurrentContextStore } from '@/shared/currentContext'
import { useRouting } from '@/shared/routing'
import type { GetFormsQuery } from '@/shared/graphql/generated/operations'

type FormItem = GetFormsQuery['forms'][number]

definePage({
  meta: {
    requiresAuth: true,
  },
})

// Context & Data - use toRefs for proper Pinia reactivity (same pattern as sidebar)
const contextStore = useCurrentContextStore()
const { currentOrganizationId, isReady } = toRefs(contextStore)

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}))

const { forms, isLoading } = useGetForms(variables)

// Routing
const { goToNewForm, goToForm, goToFormEdit, goToFormResponses, goToFormSettings } = useRouting()

// Computed states
// Show loading when context is not ready OR when query is loading
// isReady becomes true only after auth is initialized AND org is loaded
const showLoading = computed(() => !isReady.value || isLoading.value)
const hasForms = computed(() => forms.value.length > 0)

// Status badge configuration
const getStatusConfig = (form: FormItem) => {
  if (form.status === 'draft') {
    return {
      label: 'Draft',
      variant: 'outline' as const,
      class: 'border-amber-200 bg-amber-50 text-amber-700',
    }
  }
  if (!form.is_active) {
    return {
      label: 'Inactive',
      variant: 'outline' as const,
      class: 'border-muted bg-muted text-muted-foreground',
    }
  }
  return {
    label: 'Published',
    variant: 'outline' as const,
    class: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  }
}

// Format date to relative time
const formatDate = (dateString: string) => {
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
  <AuthLayout>
    <div class="min-h-full bg-background">
      <!-- Page Container -->
      <div class="mx-auto max-w-6xl px-6 py-8">
        <!-- Page Header -->
        <header class="flex items-start justify-between mb-8">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight text-foreground">
              Forms
            </h1>
            <p class="text-sm text-muted-foreground">
              Create and manage your testimonial collection forms.
            </p>
          </div>

          <Button @click="goToNewForm" class="gap-2">
            <Icon icon="heroicons:plus" class="h-4 w-4" />
            Create Form
          </Button>
        </header>

        <!-- Loading State (shown while auth initializes OR query loads) -->
        <div v-if="showLoading" class="rounded-xl border border-border bg-card overflow-hidden">
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
              <tr v-for="n in 6" :key="n" class="group">
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

        <!-- Empty State (only shown after loading completes with no forms) -->
        <div
          v-else-if="!hasForms"
          class="flex flex-col items-center justify-center py-16 px-4"
        >
          <!-- Decorative Icon Background -->
          <div class="relative mb-6">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl transform rotate-6 scale-110" />
            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl transform -rotate-3 scale-105" />
            <div class="relative bg-card rounded-2xl p-6 shadow-sm border">
              <Icon icon="heroicons:document-plus" class="h-12 w-12 text-primary" />
            </div>
          </div>

          <h2 class="text-lg font-medium text-foreground mb-2">
            No forms yet
          </h2>
          <p class="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Create your first form to start collecting testimonials from your customers.
          </p>

          <Button @click="goToNewForm" class="gap-2">
            <Icon icon="heroicons:plus" class="h-4 w-4" />
            Create Your First Form
          </Button>
        </div>

        <!-- Forms Table -->
        <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
          <!-- Table -->
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

            <!-- Table Body -->
            <tbody class="divide-y divide-border/50">
              <tr
                v-for="form in forms"
                :key="form.id"
                class="group transition-colors hover:bg-muted/30 cursor-pointer"
                @click="goToForm(form)"
              >
                <!-- Form Name -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <!-- Form Icon -->
                    <div
                      class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                      :class="[
                        form.status === 'draft'
                          ? 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600'
                          : form.is_active
                            ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary'
                            : 'bg-muted text-muted-foreground'
                      ]"
                    >
                      <Icon icon="heroicons:document-text" class="h-4 w-4" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                        {{ form.name }}
                      </p>
                      <!-- Show product on mobile -->
                      <p v-if="form.product_name" class="text-xs text-muted-foreground truncate max-w-[180px] md:hidden">
                        {{ form.product_name }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Product Name (hidden on mobile) -->
                <td class="py-3 px-4 hidden md:table-cell">
                  <p class="text-sm text-muted-foreground truncate max-w-[150px]">
                    {{ form.product_name || '—' }}
                  </p>
                </td>

                <!-- Status -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="[
                        form.status === 'draft'
                          ? 'bg-amber-500'
                          : form.is_active
                            ? 'bg-emerald-500'
                            : 'bg-muted-foreground/50'
                      ]"
                    />
                    <span
                      class="text-xs font-medium"
                      :class="[
                        form.status === 'draft'
                          ? 'text-amber-600'
                          : form.is_active
                            ? 'text-emerald-600'
                            : 'text-muted-foreground'
                      ]"
                    >
                      {{ getStatusConfig(form).label }}
                    </span>
                  </div>
                </td>

                <!-- Responses Count (hidden on very small screens) -->
                <td class="py-3 px-4 text-center hidden sm:table-cell">
                  <span class="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    0
                  </span>
                </td>

                <!-- Last Updated (hidden on smaller screens) -->
                <td class="py-3 px-4 hidden lg:table-cell">
                  <p class="text-sm text-muted-foreground">
                    {{ formatDate(form.updated_at) }}
                  </p>
                </td>

                <!-- Actions -->
                <td class="py-3 px-2" @click.stop>
                  <div class="flex items-center justify-end gap-1">
                    <!-- Edit -->
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
                      title="Edit form"
                      @click="goToFormEdit(form)"
                    >
                      <Icon icon="heroicons:pencil-square" class="h-4 w-4 text-muted-foreground" />
                      <span class="sr-only">Edit form</span>
                    </Button>

                    <!-- Responses -->
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
                      title="View responses"
                      @click="goToFormResponses(form)"
                    >
                      <Icon icon="heroicons:inbox" class="h-4 w-4 text-muted-foreground" />
                      <span class="sr-only">View responses</span>
                    </Button>

                    <!-- Settings -->
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      class="opacity-40 group-hover:opacity-100 hover:bg-muted transition-all"
                      title="Form settings"
                      @click="goToFormSettings(form)"
                    >
                      <Icon icon="heroicons:cog-6-tooth" class="h-4 w-4 text-muted-foreground" />
                      <span class="sr-only">Form settings</span>
                    </Button>

                    <!-- More actions dropdown -->
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
                        <DropdownMenuItem @click="goToForm(form)" class="gap-2">
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
                        <DropdownMenuItem class="gap-2 text-destructive focus:text-destructive">
                          <Icon icon="heroicons:trash" class="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
