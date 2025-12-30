<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@testimonials/icons'
import { useRouting } from '@/shared/routing'

// TODO: Replace with actual forms data from composable
// import { useForms } from '@/entities/form'

interface Form {
  id: string
  name: string
  status: 'active' | 'draft' | 'archived'
  testimonialCount?: number
}

// Placeholder data - replace with actual form fetching
const forms = ref<Form[]>([])
const isLoading = ref(false)

const route = useRoute()
const { goToNewForm, goToForm, goToFormResponses, goToFormSettings, getFormPath } = useRouting()

const expandedFormIds = ref<Set<string>>(new Set())
const allExpanded = ref(false)

const hasActiveForms = computed(() => forms.value.length > 0)

const toggleFormExpansion = (formId: string) => {
  if (expandedFormIds.value.has(formId)) {
    expandedFormIds.value.delete(formId)
  } else {
    expandedFormIds.value.add(formId)
  }
}

const isFormExpanded = (formId: string) => expandedFormIds.value.has(formId)

const toggleAllForms = () => {
  if (allExpanded.value) {
    expandedFormIds.value.clear()
  } else {
    forms.value.forEach((form) => expandedFormIds.value.add(form.id))
  }
  allExpanded.value = !allExpanded.value
}

const isFormActive = (form: Form) => {
  return route.path.startsWith(getFormPath(form))
}

const isSubItemActive = (form: Form, segment: string) => {
  const basePath = getFormPath(form)
  return segment === ''
    ? route.path === basePath
    : route.path === `${basePath}/${segment}`
}

const navigateToSubItem = (form: Form, segment: string) => {
  switch (segment) {
    case 'responses':
      goToFormResponses(form)
      break
    case 'settings':
      goToFormSettings(form)
      break
    default:
      goToForm(form)
  }
}

const truncateTitle = (title: string, maxLength = 20) => {
  if (title.length <= maxLength) return title
  return title.slice(0, maxLength) + '...'
}

const formSubItems = [
  { id: 'overview', label: 'Overview', icon: 'heroicons:chart-bar', segment: '' },
  { id: 'responses', label: 'Responses', icon: 'heroicons:inbox', segment: 'responses' },
  { id: 'settings', label: 'Settings', icon: 'heroicons:cog-6-tooth', segment: 'settings' },
]

const getStatusBadge = (status: Form['status']) => {
  switch (status) {
    case 'draft':
      return { label: 'Draft', class: 'bg-amber-100 text-amber-700' }
    case 'archived':
      return { label: 'Archived', class: 'bg-gray-100 text-gray-600' }
    default:
      return null
  }
}
</script>

<template>
  <div>
    <!-- Section Header -->
    <div class="flex items-center justify-between px-2 mb-3">
      <div class="flex items-center gap-2">
        <Icon icon="heroicons:document-text" class="h-3 w-3 text-gray-500" />
        <span class="text-[10px] text-gray-600 uppercase tracking-wide font-medium">
          Your Forms
        </span>
      </div>

      <!-- Expand/Collapse All Button -->
      <button
        v-if="hasActiveForms"
        class="text-[10px] text-gray-500 hover:text-gray-700 transition-colors duration-200"
        @click="toggleAllForms"
      >
        {{ allExpanded ? 'Collapse' : 'Expand' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-2 py-4">
      <div class="space-y-2">
        <div class="h-6 bg-gray-100 rounded animate-pulse" />
        <div class="h-6 bg-gray-100 rounded animate-pulse w-3/4" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!hasActiveForms"
      class="px-2 py-6 flex flex-col items-center justify-center"
    >
      <div class="relative mb-3">
        <!-- Decorative background -->
        <div class="absolute inset-0 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg transform rotate-3" />
        <div class="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg transform -rotate-2" />
        <!-- Icon container -->
        <div class="relative bg-white rounded-lg p-3 shadow-sm">
          <Icon icon="heroicons:document-plus" class="h-6 w-6 text-teal-500" />
        </div>
      </div>
      <p class="text-xs text-gray-500 text-center">No forms yet</p>
      <button
        class="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
        @click="goToNewForm"
      >
        Create your first form
      </button>
    </div>

    <!-- Forms List -->
    <nav v-else class="space-y-1">
      <div v-for="form in forms" :key="form.id">
        <!-- Form Header Button -->
        <button
          class="w-full flex items-center px-2 py-1.5 text-xs rounded-md transition-all duration-200 group relative"
          :class="[
            isFormActive(form)
              ? 'bg-teal-50 text-teal-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          ]"
          @click="toggleFormExpansion(form.id)"
        >
          <!-- Accent bar -->
          <span
            class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            :class="{ 'opacity-100': isFormActive(form) }"
          />

          <!-- Expand/Collapse chevron -->
          <Icon
            icon="heroicons:chevron-right"
            class="h-3 w-3 mr-1.5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-90': isFormExpanded(form.id) }"
          />

          <!-- Form icon with gradient for archived -->
          <Icon
            icon="heroicons:document-text"
            class="h-4 w-4 mr-2 transition-colors duration-200"
            :class="[
              form.status === 'archived'
                ? 'text-amber-500'
                : isFormActive(form)
                  ? 'text-teal-600'
                  : 'text-gray-500 group-hover:text-gray-700',
            ]"
          />

          <span class="flex-1 text-left truncate" :title="form.name">
            {{ truncateTitle(form.name) }}
          </span>

          <!-- Status Badge -->
          <span
            v-if="getStatusBadge(form.status)"
            class="ml-1 px-1 py-0.5 text-[9px] font-medium rounded"
            :class="getStatusBadge(form.status)?.class"
          >
            {{ getStatusBadge(form.status)?.label }}
          </span>

          <!-- Testimonial Count Badge -->
          <span
            v-else-if="form.testimonialCount"
            class="ml-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600"
          >
            {{ form.testimonialCount }}
          </span>
        </button>

        <!-- Sub Navigation (Expanded) -->
        <div
          class="overflow-hidden transition-all duration-200 ease-in-out"
          :class="isFormExpanded(form.id) ? 'max-h-40' : 'max-h-0'"
        >
          <div class="ml-4 mt-1 pl-2 border-l border-gray-200 space-y-0.5">
            <button
              v-for="subItem in formSubItems"
              :key="subItem.id"
              class="w-full flex items-center px-2 py-1 text-xs rounded-md transition-all duration-200 group relative"
              :class="[
                isSubItemActive(form, subItem.segment)
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              ]"
              @click="navigateToSubItem(form, subItem.segment)"
            >
              <!-- Accent bar -->
              <span
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-r-full bg-gradient-to-b from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                :class="{ 'opacity-100': isSubItemActive(form, subItem.segment) }"
              />

              <Icon
                :icon="subItem.icon"
                class="h-3.5 w-3.5 mr-2 transition-colors duration-200"
                :class="[
                  isSubItemActive(form, subItem.segment)
                    ? 'text-emerald-600'
                    : 'text-gray-400 group-hover:text-gray-600',
                ]"
              />
              <span>{{ subItem.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
