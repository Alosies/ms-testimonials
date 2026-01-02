<script setup lang="ts">
/**
 * Forms list page
 * Route: /:org/forms
 *
 * Displays all forms for the current organization with:
 * - Create new form action
 * - Searchable, sortable table of forms
 * - Loading and empty states
 */
import { computed, toRefs } from 'vue'
import { definePage } from 'unplugin-vue-router/runtime'
import { Icon } from '@testimonials/icons'
import { Button, Input } from '@testimonials/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import {
  FormsTable,
  FormsTableSkeleton,
  FormsEmptyState,
  FormsNoResults,
  useFormsTableState,
} from '@/features/formsList'
import type { FormItem } from '@/features/formsList'
import { useGetForms, useDeleteForm } from '@/entities/form'
import { useCurrentContextStore } from '@/shared/currentContext'
import { useRouting } from '@/shared/routing'
import { useConfirmationModal } from '@/shared/widgets/ConfirmationModal'

definePage({
  meta: {
    requiresAuth: true,
  },
})

// Context & Data
const contextStore = useCurrentContextStore()
const { currentOrganizationId, isReady } = toRefs(contextStore)

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}))

const { forms, isLoading, refetch } = useGetForms(variables)

// Delete functionality
const { deleteForm } = useDeleteForm()
const { showConfirmation } = useConfirmationModal()

const handleDeleteForm = (form: FormItem) => {
  showConfirmation({
    actionType: 'delete_form',
    entityName: form.name,
    onConfirm: async () => {
      await deleteForm({ id: form.id })
      await refetch()
    },
  })
}

// Routing
const { goToNewForm, goToForm, goToFormEdit, goToFormResponses, goToFormSettings } = useRouting()

// Table state (search & sort)
const {
  searchQuery,
  sortColumn,
  sortDirection,
  filteredAndSortedForms,
  hasFilteredForms,
  isSearching,
  toggleSort,
  clearSearch,
} = useFormsTableState(forms)

// Computed states
const showLoading = computed(() => !isReady.value || isLoading.value)
const hasForms = computed(() => forms.value.length > 0)
const showSearchBar = computed(() => hasForms.value || isSearching.value)
const showTable = computed(() => !showLoading.value && hasForms.value && hasFilteredForms.value)
const showEmptyState = computed(() => !showLoading.value && !hasForms.value)
const showNoResults = computed(() => !showLoading.value && hasForms.value && !hasFilteredForms.value)
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-background">
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

        <!-- Search Bar -->
        <div v-if="showSearchBar" class="mb-4">
          <div class="relative max-w-sm">
            <Icon
              icon="heroicons:magnifying-glass"
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Search forms..."
              class="pl-9"
            />
          </div>
        </div>

        <!-- Loading State -->
        <FormsTableSkeleton v-if="showLoading" />

        <!-- Empty State -->
        <FormsEmptyState v-else-if="showEmptyState" @create-form="goToNewForm" />

        <!-- Forms Table -->
        <FormsTable
          v-else-if="showTable"
          :forms="filteredAndSortedForms"
          :sort-column="sortColumn"
          :sort-direction="sortDirection"
          @sort="toggleSort"
          @view-form="goToForm"
          @edit-form="goToFormEdit"
          @view-responses="goToFormResponses"
          @open-settings="goToFormSettings"
          @delete-form="handleDeleteForm"
        />

        <!-- No Search Results -->
        <FormsNoResults
          v-else-if="showNoResults"
          :search-query="searchQuery"
          @clear-search="clearSearch"
        />
      </div>
    </div>
  </AuthLayout>
</template>
