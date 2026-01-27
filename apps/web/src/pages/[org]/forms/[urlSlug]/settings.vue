<script setup lang="ts">
/**
 * Form settings page
 * Route: /:org/forms/:urlSlug/settings
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { extractEntityIdFromSlug } from '@/shared/urls'
import { FormSubpageHeader } from '@/features/formDashboard'
import { FormSettingsPanel } from '@/features/formSettings'
import { useGetForm } from '@/entities/form'
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

// Fetch form data
const formQueryVars = computed(() => ({
  formId: formId.value ?? '',
}))
const { form, isLoading, error, refetch } = useGetForm(formQueryVars)

// Create a FormRef object for navigation
const formRef = computed(() => ({
  id: formId.value ?? '',
  name: form.value?.name ?? entityInfo.value?.slug ?? 'form',
}))

function handleSaved() {
  refetch()
}
</script>

<template>
  <FormSubpageLayout>
    <div v-if="!entityInfo?.isValid" class="text-destructive">
      Invalid form URL
    </div>
    <template v-else>
      <FormSubpageHeader
        :form-ref="formRef"
        title="Settings"
        subtitle="Configure form options"
      />

      <!-- Loading state -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-12"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center"
      >
        <p class="text-destructive">
          Failed to load form settings. Please try again.
        </p>
      </div>

      <!-- Form not found -->
      <div
        v-else-if="!form"
        class="rounded-lg border border-border bg-card p-8 text-center"
      >
        <p class="text-muted-foreground">
          Form not found.
        </p>
      </div>

      <!-- Settings panel -->
      <FormSettingsPanel
        v-else
        :form="form"
        @saved="handleSaved"
      />
    </template>
  </FormSubpageLayout>
</template>
