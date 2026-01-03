<script setup lang="ts">
// Minimal layout - just structure
</script>

<template>
  <div class="flex h-screen flex-col bg-background">
    <!-- Header slot -->
    <header class="shrink-0 border-b border-border">
      <slot name="header" />
    </header>

    <!-- Three-panel body -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Steps Sidebar (80px) -->
      <aside class="w-20 shrink-0 border-r border-border bg-muted/30 overflow-y-auto">
        <slot name="sidebar" />
      </aside>

      <!-- Center: Timeline Canvas (fluid) -->
      <main class="flex-1 overflow-y-auto bg-muted/10">
        <slot name="timeline" />
      </main>

      <!-- Right: Properties Panel (280px) -->
      <aside class="w-72 shrink-0 border-l border-border overflow-y-auto">
        <slot name="properties" />
      </aside>
    </div>
  </div>
</template>
