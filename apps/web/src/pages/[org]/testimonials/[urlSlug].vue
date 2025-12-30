<script setup lang="ts">
/**
 * Testimonial detail page
 * Route: /:org/testimonials/:urlSlug
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
const testimonialId = computed(() => entityInfo.value?.entityId ?? null)
</script>

<template>
  <AuthLayout>
    <div class="p-6">
      <div v-if="!entityInfo?.isValid" class="text-red-600">
        Invalid testimonial URL
      </div>
      <div v-else>
        <h1 class="text-2xl font-semibold text-gray-900">Testimonial Details</h1>
        <p class="mt-2 text-gray-600">Testimonial ID: {{ testimonialId }}</p>
        <!-- TODO: Add TestimonialDetailFeature component -->
      </div>
    </div>
  </AuthLayout>
</template>
