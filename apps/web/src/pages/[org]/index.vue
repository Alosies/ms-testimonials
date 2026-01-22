<script setup lang="ts">
/**
 * Organization root page - redirects to dashboard
 * Route: /:org
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { Icon } from '@testimonials/icons'

definePage({
  meta: {
    requiresAuth: true,
  },
})

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const org = route.params.org as string
  router.replace(`/${org}/dashboard`)
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center overflow-hidden">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <!-- Corner glows -->
      <div class="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />
      <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-teal-100/40 blur-3xl" />
    </div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center px-8">
      <!-- Animated icon -->
      <div class="mb-8 flex justify-center">
        <div class="relative animate-float-gentle">
          <!-- Pulse rings -->
          <div class="absolute -inset-3 animate-ping-slow rounded-full bg-teal-500/10" />
          <div class="absolute -inset-5 animate-ping-slower rounded-full bg-teal-500/5" />

          <div class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/25">
            <Icon icon="lucide:layout-dashboard" class="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      <!-- Loading text -->
      <div class="text-center">
        <span class="text-lg font-medium text-foreground">
          Opening your dashboard
        </span>
        <p class="mt-2 text-sm text-muted-foreground">
          Redirecting...
        </p>
      </div>
    </div>
  </div>
</template>
