<script setup lang="ts">
import { SidebarNavigation } from '@/features/sidebar'
</script>

<template>
  <div class="flex h-screen bg-white">
    <!-- Sidebar -->
    <SidebarNavigation />

    <!-- Main Content Area -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
