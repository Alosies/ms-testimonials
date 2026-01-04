<script setup lang="ts">
import { ref, computed, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@testimonials/icons'
import { useRouting } from '@/shared/routing'
import { useGetForms } from '@/entities/form'
import { useCurrentContextStore } from '@/shared/currentContext'
import type { GetFormsQuery } from '@/shared/graphql/generated/operations'

type FormItem = GetFormsQuery['forms'][number]

const contextStore = useCurrentContextStore()
const { currentOrganizationId } = toRefs(contextStore)

const variables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}))

const { forms: formsData, isLoading } = useGetForms(variables)

// Expose forms as a computed for template usage
const forms = computed(() => formsData.value)

const route = useRoute()
const { goToNewForm, goToForm, goToFormStudio, goToFormResponses, goToFormSettings, getFormPath } = useRouting()

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

const isFormActive = (form: FormItem) => {
  return route.path.startsWith(getFormPath(form))
}

const isSubItemActive = (form: FormItem, segment: string) => {
  const basePath = getFormPath(form)
  return segment === ''
    ? route.path === basePath
    : route.path === `${basePath}/${segment}`
}

const navigateToSubItem = (form: FormItem, segment: string) => {
  switch (segment) {
    case 'studio':
      goToFormStudio(form)
      break
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
  { id: 'studio', label: 'Studio', icon: 'heroicons:paint-brush', segment: 'studio' },
  { id: 'responses', label: 'Responses', icon: 'heroicons:inbox', segment: 'responses' },
  { id: 'settings', label: 'Settings', icon: 'heroicons:cog-6-tooth', segment: 'settings' },
]

const getStatusBadge = (form: FormItem) => {
  if (form.status === 'draft') {
    return { label: 'Draft', class: 'bg-amber-100 text-amber-700' }
  }
  return null
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
        {{ allExpanded ? 'Collapse all' : 'Expand all' }}
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

          <!-- Form icon -->
          <Icon
            icon="heroicons:document-text"
            class="h-4 w-4 mr-2 transition-colors duration-200"
            :class="[
              isFormActive(form)
                ? 'text-teal-600'
                : 'text-gray-500 group-hover:text-gray-700',
            ]"
          />

          <span class="flex-1 text-left truncate" :title="form.name">
            {{ truncateTitle(form.name) }}
          </span>

          <!-- Status Badge -->
          <span
            v-if="getStatusBadge(form)"
            class="ml-1 px-1 py-0.5 text-[9px] font-medium rounded"
            :class="getStatusBadge(form)?.class"
          >
            {{ getStatusBadge(form)?.label }}
          </span>

        </button>

        <!-- Sub Navigation (Expanded) -->
        <div
          class="overflow-hidden transition-all duration-200 ease-in-out"
          :class="isFormExpanded(form.id) ? 'max-h-48' : 'max-h-0'"
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
