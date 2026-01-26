<script setup lang="ts">
/**
 * Form widgets page
 * Route: /:org/forms/:urlSlug/widgets
 *
 * Displays widgets associated with this form and allows creating new ones.
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { Icon } from '@testimonials/icons'
import { Button } from '@testimonials/ui'
import { extractEntityIdFromSlug } from '@/shared/urls'
import { useRouting } from '@/shared/routing'
import { FormSubpageHeader } from '@/features/formDashboard'
import FormSubpageLayout from '@/layouts/FormSubpageLayout.vue'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()
const { goToNewWidget } = useRouting()

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
    <template v-else>
      <FormSubpageHeader
            :form-ref="formRef"
            title="Widgets"
            subtitle="Embed testimonials from this form on your website"
          >
            <template #actions>
              <Button @click="goToNewWidget" class="gap-1.5">
                <Icon icon="heroicons:plus" class="h-4 w-4" />
                Create Widget
              </Button>
            </template>
          </FormSubpageHeader>

          <!-- Empty State -->
          <div class="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Icon icon="heroicons:squares-2x2" class="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-medium text-foreground">
              No widgets yet
            </h3>
            <p class="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Create a widget to display testimonials from this form on your website.
              Choose from Wall of Love, Carousel, or Single Quote styles.
            </p>
            <Button @click="goToNewWidget" variant="outline" class="mt-6 gap-1.5">
              <Icon icon="heroicons:plus" class="h-4 w-4" />
              Create Your First Widget
            </Button>
          </div>
    </template>
  </FormSubpageLayout>
</template>
