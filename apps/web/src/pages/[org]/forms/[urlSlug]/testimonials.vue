<script setup lang="ts">
/**
 * Form Testimonials page
 * Route: /:org/forms/:urlSlug/testimonials
 *
 * Shows testimonials collected from this specific form.
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { extractEntityIdFromSlug } from '@/shared/urls'
import { FormSubpageHeader } from '@/features/formDashboard'
import FormSubpageLayout from '@/layouts/FormSubpageLayout.vue'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()

const urlSlug = computed(() => route.params.urlSlug as string)
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value))
const formId = computed(() => entityInfo.value?.entityId ?? null)

// Create a FormRef object for navigation
const formRef = computed(() => ({
  id: formId.value ?? '',
  name: entityInfo.value?.slug ?? 'form',
}))
</script>

<template>
  <FormSubpageLayout>
    <div v-if="!entityInfo?.isValid" class="text-destructive">
      Invalid form URL
    </div>
    <template v-else-if="formId">
      <FormSubpageHeader
        :form-ref="formRef"
        title="Testimonials"
        subtitle="Testimonials collected from this form"
      />

      <!-- Placeholder for testimonials list filtered by form -->
      <div class="rounded-lg border border-border bg-card p-8 text-center">
        <p class="text-muted-foreground">
          Testimonials filtered by form coming soon.
        </p>
      </div>
    </template>
  </FormSubpageLayout>
</template>
