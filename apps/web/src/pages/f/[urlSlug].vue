<script setup lang="ts">
/**
 * Public form collection page
 * Route: /f/:urlSlug (where urlSlug follows {name}_{id} pattern per ADR-005)
 *
 * This is the customer-facing page where testimonials are submitted.
 * URL pattern: /f/product-feedback_xK9mP2qR4tYn
 * Resolution: Extract ID from after last underscore, fetch by primary key
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute, useRouter } from 'vue-router'
import { computed, watchEffect } from 'vue'
import { extractEntityIdFromSlug } from '@/shared/urls'

definePage({
  meta: {
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

// Extract form ID from URL slug (name_id pattern)
const urlSlug = computed(() => route.params.urlSlug as string)
const extractedInfo = computed(() => extractEntityIdFromSlug(urlSlug.value))
const formId = computed(() => extractedInfo.value?.entityId ?? '')
const isValidUrl = computed(() => extractedInfo.value?.isValid ?? false)

// Reactively redirect to 404 if URL is invalid
watchEffect(() => {
  if (urlSlug.value && !isValidUrl.value) {
    router.replace('/404')
  }
})

// TODO: Fetch form by ID (not slug)
// const { data: form, loading, error } = useGetFormByPk({ id: formId })
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-2xl px-4 py-12">
      <h1 class="text-2xl font-semibold text-gray-900">Testimonial Form</h1>
      <p class="mt-2 text-gray-600">Form ID: {{ formId }}</p>
      <p v-if="!isValidUrl" class="mt-2 text-red-600">Invalid form URL</p>
      <!-- TODO: Add PublicFormFeature component -->
    </div>
  </div>
</template>
