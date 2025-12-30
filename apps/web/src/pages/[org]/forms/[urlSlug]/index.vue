<script setup lang="ts">
/**
 * Form detail/overview page
 * Route: /:org/forms/:urlSlug
 *
 * URL Pattern: The urlSlug contains {slug}_{id}
 * Resolution: Extract ID from urlSlug, fetch form by primary key
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { extractEntityIdFromSlug } from '@/shared/urls'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()

const urlSlug = computed(() => route.params.urlSlug as string)
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value))
const formId = computed(() => entityInfo.value?.entityId ?? null)

// TODO: Use formId to fetch form data
// const { data: form } = useGetFormByPk({ id: formId })
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <div v-if="!entityInfo?.isValid" class="text-red-600">
        Invalid form URL
      </div>
      <div v-else>
        <h1 class="text-2xl font-semibold text-gray-900">Form Overview</h1>
        <p class="mt-2 text-gray-600">Form ID: {{ formId }}</p>
        <!-- TODO: Add FormOverviewFeature component -->
      </div>
    </div>
  </AuthLayout>
</template>
