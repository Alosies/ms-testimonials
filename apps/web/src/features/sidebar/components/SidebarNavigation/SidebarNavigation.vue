<script setup lang="ts">
import ApplicationNavigation from './ApplicationNavigation.vue'
import FormsNavigation from './FormsNavigation.vue'
import UserProfileSection from './UserProfileSection.vue'
</script>

<template>
  <aside
    class="flex flex-col h-full w-56 bg-gray-50 border-r border-gray-200 overflow-hidden"
  >
    <!-- Logo/Brand -->
    <div class="px-4 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
          <svg
            class="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <span class="font-semibold text-gray-900">Testimonials</span>
      </div>
    </div>

    <!-- Main Navigation Area (Scrollable) -->
    <div class="flex-1 overflow-y-auto px-3 py-4 scrollbar-subtle">
      <div class="space-y-6">
        <!-- Application Navigation -->
        <ApplicationNavigation />

        <!-- Forms Navigation -->
        <FormsNavigation />
      </div>
    </div>

    <!-- User Profile Section (Sticky Bottom) -->
    <UserProfileSection />
  </aside>
</template>

<style scoped>
.scrollbar-subtle::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-subtle::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-subtle::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.scrollbar-subtle::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
