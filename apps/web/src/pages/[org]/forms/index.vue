<script setup lang="ts">
/**
 * Forms list page
 * Route: /:org/forms
 *
 * Displays all forms for the current organization with:
 * - Create new form action
 * - Form cards with status, responses count, and quick actions
 * - Loading and empty states
 */
import { computed, toRefs } from 'vue'
import { definePage } from 'unplugin-vue-router/runtime'
import { Icon } from '@testimonials/icons'
import {
  Button,
  Card,
  Badge,
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

// Context & Data
const contextStore = useCurrentContextStore()
const { currentOrganizationId } = toRefs(contextStore)

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}))

const { forms, isLoading } = useGetForms(variables)

// Routing
const { goToNewForm, goToForm, goToFormEdit, goToFormResponses, goToFormSettings } = useRouting()

// Computed states
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

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card v-for="n in 6" :key="n" class="p-6">
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <Skeleton class="h-5 w-32" />
                <Skeleton class="h-5 w-16" />
              </div>
              <Skeleton class="h-4 w-48" />
              <div class="flex items-center gap-4 pt-2">
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-4 w-24" />
              </div>
            </div>
          </Card>
        </div>

        <!-- Empty State -->
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

        <!-- Forms Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="form in forms"
            :key="form.id"
            class="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20"
          >
            <!-- Gradient Accent (visible on hover) -->
            <div
              class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />

            <div class="relative z-10 p-6">
              <!-- Card Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <!-- Form Icon -->
                  <div
                    class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
                    :class="[
                      form.status === 'draft'
                        ? 'bg-amber-100 text-amber-600'
                        : form.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                    ]"
                  >
                    <Icon icon="heroicons:document-text" class="h-5 w-5" />
                  </div>

                  <!-- Form Name & Status -->
                  <div class="min-w-0 flex-1">
                    <h3
                      class="text-base font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      :title="form.name"
                      @click="goToForm(form)"
                    >
                      {{ form.name }}
                    </h3>
                    <Badge
                      variant="outline"
                      :class="getStatusConfig(form).class"
                      class="mt-1 text-[10px] px-1.5 py-0"
                    >
                      {{ getStatusConfig(form).label }}
                    </Badge>
                  </div>
                </div>

                <!-- Actions Menu -->
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      class="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
                    >
                      <Icon icon="heroicons:ellipsis-vertical" class="h-4 w-4" />
                      <span class="sr-only">Form actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-48">
                    <DropdownMenuItem @click="goToFormEdit(form)" class="gap-2">
                      <Icon icon="heroicons:pencil-square" class="h-4 w-4" />
                      Edit Form
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="goToFormResponses(form)" class="gap-2">
                      <Icon icon="heroicons:inbox" class="h-4 w-4" />
                      View Responses
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="goToFormSettings(form)" class="gap-2">
                      <Icon icon="heroicons:cog-6-tooth" class="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="gap-2 text-destructive focus:text-destructive">
                      <Icon icon="heroicons:trash" class="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <!-- Product Name -->
              <p
                v-if="form.product_name"
                class="text-sm text-muted-foreground truncate mb-4"
                :title="form.product_name"
              >
                {{ form.product_name }}
              </p>

              <!-- Card Footer - Meta Info -->
              <div class="flex items-center gap-4 pt-3 border-t border-border/50">
                <!-- Responses Count (placeholder for now) -->
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon icon="heroicons:chat-bubble-left-right" class="h-3.5 w-3.5" />
                  <span>0 responses</span>
                </div>

                <!-- Last Updated -->
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon icon="heroicons:clock" class="h-3.5 w-3.5" />
                  <span>{{ formatDate(form.updated_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Click overlay for card navigation -->
            <button
              class="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-xl"
              @click="goToForm(form)"
            >
              <span class="sr-only">View {{ form.name }}</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
