<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@testimonials/icons'
import { useApplicationMenuItems } from '../../composables'

const route = useRoute()
const { applicationMenuItems } = useApplicationMenuItems()

const mainItems = computed(() =>
  applicationMenuItems.value.filter((item) => item.section !== 'secondary')
)

const secondaryItems = computed(() =>
  applicationMenuItems.value.filter((item) => item.section === 'secondary')
)

const isActive = (item: (typeof applicationMenuItems.value)[0]) => {
  if (typeof item.action === 'string') {
    return route.path === item.action || route.path.startsWith(item.action + '/')
  }
  return route.path === `/${item.id}` || route.path.startsWith(`/${item.id}/`)
}

const handleClick = (item: (typeof applicationMenuItems.value)[0]) => {
  if (item.disabled) return
  if (typeof item.action === 'function') {
    item.action()
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Main Navigation Section -->
    <div>
      <div class="flex items-center gap-2 px-2 mb-3">
        <Icon icon="heroicons:building-office-2" class="h-3 w-3 text-gray-500" />
        <span class="text-[10px] text-gray-600 uppercase tracking-wide font-medium">
          Workspace
        </span>
      </div>

      <nav class="space-y-0.5">
        <button
          v-for="item in mainItems"
          :key="item.id"
          :data-testid="item.testId"
          :disabled="item.disabled"
          class="flex items-center px-2 py-1.5 text-xs rounded-md transition-all duration-200 w-full text-left group relative"
          :class="[
            isActive(item)
              ? 'bg-teal-50 text-teal-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ]"
          @click="handleClick(item)"
        >
          <!-- Accent bar on hover -->
          <span
            class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            :class="{ 'opacity-100': isActive(item) }"
          />

          <Icon
            :icon="item.icon"
            class="h-4 w-4 mr-2 transition-colors duration-200"
            :class="[
              isActive(item)
                ? 'text-teal-600'
                : 'text-gray-500 group-hover:text-gray-700',
            ]"
          />
          <span>{{ item.label }}</span>

          <!-- Badge -->
          <span
            v-if="item.badge"
            class="ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded-full"
            :class="[
              isActive(item)
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600',
            ]"
          >
            {{ item.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Secondary Navigation Section -->
    <div v-if="secondaryItems.length > 0">
      <div class="border-t border-gray-200 pt-4">
        <nav class="space-y-0.5">
          <button
            v-for="item in secondaryItems"
            :key="item.id"
            :data-testid="item.testId"
            :disabled="item.disabled"
            class="flex items-center px-2 py-1.5 text-xs rounded-md transition-all duration-200 w-full text-left group relative"
            :class="[
              isActive(item)
                ? 'bg-teal-50 text-teal-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
              item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            @click="handleClick(item)"
          >
            <!-- Accent bar on hover -->
            <span
              class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-gradient-to-b from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              :class="{ 'opacity-100': isActive(item) }"
            />

            <Icon
              :icon="item.icon"
              class="h-4 w-4 mr-2 transition-colors duration-200"
              :class="[
                isActive(item)
                  ? 'text-teal-600'
                  : 'text-gray-500 group-hover:text-gray-700',
              ]"
            />
            <span>{{ item.label }}</span>

            <!-- Badge/Indicator (e.g., setup pending) -->
            <span
              v-if="item.badge"
              class="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200"
              :title="item.id === 'settings' ? 'Complete your workspace setup' : ''"
            >
              <Icon icon="heroicons:exclamation-circle" class="w-3 h-3" />
              {{ item.badge }}
            </span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
