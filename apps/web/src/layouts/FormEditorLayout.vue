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
      <!-- Left: Steps Sidebar (240px) -->
      <aside class="w-60 shrink-0 border-r border-border bg-muted/30 overflow-y-auto scrollbar-subtle">
        <slot name="sidebar" />
      </aside>

      <!-- Center: Timeline Canvas (fluid) - Figma-style dotted grid with scroll-snap -->
      <main class="flex-1 overflow-y-auto canvas-grid scrollbar-subtle timeline-scroll">
        <slot name="timeline" />
      </main>

      <!-- Right: Properties Panel (280px) -->
      <aside class="w-72 shrink-0 border-l border-border bg-background overflow-y-auto scrollbar-subtle">
        <slot name="properties" />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.canvas-grid {
  background-color: hsl(var(--muted) / 0.3);
  background-image: radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Senja-inspired scroll snap for timeline */
.timeline-scroll {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scroll-padding: 10vh 0;
}
</style>
