<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@testimonials/icons'
import { useAuth } from '@/features/auth'
import { useUserActions } from '../../composables'

const { currentUser } = useAuth()
const { handleLogout } = useUserActions()

const isExpanded = ref(false)
const isLoggingOut = ref(false)

const displayName = computed(() => {
  return currentUser.value?.display_name || currentUser.value?.email || 'User'
})

const userInitial = computed(() => {
  const name = displayName.value
  return name.charAt(0).toUpperCase()
})

const onLogout = async () => {
  isLoggingOut.value = true
  try {
    await handleLogout()
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="mt-auto border-t border-gray-200">
    <!-- User Profile Button -->
    <button
      class="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 transition-colors duration-200"
      @click="isExpanded = !isExpanded"
    >
      <!-- Avatar -->
      <div
        class="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-medium shadow-sm"
      >
        {{ userInitial }}
      </div>

      <!-- User Info -->
      <div class="flex-1 min-w-0 text-left">
        <p class="text-sm font-medium text-gray-900 truncate">
          {{ displayName }}
        </p>
        <p v-if="currentUser?.email && currentUser.display_name" class="text-xs text-gray-500 truncate">
          {{ currentUser.email }}
        </p>
      </div>

      <!-- Chevron -->
      <Icon
        icon="heroicons:chevron-up"
        class="h-4 w-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': !isExpanded }"
      />
    </button>

    <!-- Expandable Menu -->
    <div
      class="overflow-hidden transition-all duration-200 ease-in-out"
      :class="isExpanded ? 'max-h-40' : 'max-h-0'"
    >
      <div class="px-3 pb-3 space-y-1">
        <!-- Logout Button -->
        <button
          class="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 group"
          :disabled="isLoggingOut"
          @click="onLogout"
        >
          <Icon
            icon="heroicons:arrow-right-on-rectangle"
            class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            :class="{ 'animate-pulse': isLoggingOut }"
          />
          <span>{{ isLoggingOut ? 'Signing out...' : 'Sign out' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
