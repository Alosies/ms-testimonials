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
import { Icon } from '@testimonials/icons'
import { Button } from '@testimonials/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { extractEntityIdFromSlug } from '@/shared/urls'
import { useRouting } from '@/shared/routing'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()
const { goToFormStudio } = useRouting()

const urlSlug = computed(() => route.params.urlSlug as string)
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value))
const formId = computed(() => entityInfo.value?.entityId ?? null)

// Create a FormRef object for routing (uses slug as name since we don't have the actual form data yet)
const formRef = computed(() => ({
  id: formId.value ?? '',
  name: entityInfo.value?.slug ?? 'form',
}))

// TODO: Use formId to fetch form data
// const { data: form } = useGetFormByPk({ id: formId })
</script>

<template>
  <AuthLayout>
    <div class="min-h-full bg-background">
      <div class="mx-auto max-w-6xl px-6 py-8">
        <div v-if="!entityInfo?.isValid" class="text-destructive">
          Invalid form URL
        </div>
        <div v-else>
          <!-- Page Header -->
          <header class="flex items-start justify-between mb-8">
            <div class="space-y-1">
              <h1 class="text-2xl font-semibold tracking-tight text-foreground">
                Form Overview
              </h1>
              <p class="text-sm text-muted-foreground">
                Form ID: {{ formId }}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              @click="goToFormStudio(formRef)"
              class="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
            >
              <Icon icon="heroicons:paint-brush" class="h-3.5 w-3.5" />
              Studio
            </Button>
          </header>

          <!-- TODO: Add FormOverviewFeature component -->
        </div>
      </div>
    </div>
  </AuthLayout>
</template>
