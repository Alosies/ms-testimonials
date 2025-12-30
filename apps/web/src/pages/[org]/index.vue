<script setup lang="ts">
/**
 * Organization root page - redirects to dashboard
 * Route: /:org
 */
import { definePage } from 'unplugin-vue-router/runtime'
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'

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
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
  </div>
</template>
