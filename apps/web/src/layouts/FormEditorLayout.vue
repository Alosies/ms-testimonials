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
      <main class="relative flex-1 overflow-hidden">
        <!-- Fixed overlay for keyboard hints (desktop only, doesn't scroll) -->
        <div class="absolute inset-0 pointer-events-none z-10">
          <slot name="canvas-overlay" />
        </div>
        <!-- Scrollable timeline content -->
        <div class="h-full overflow-y-auto canvas-grid scrollbar-subtle timeline-scroll">
          <slot name="timeline" />
        </div>
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
  background-color: hsl(var(--muted) / 0.5);
  background-image: radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px);
  background-size: 20px 20px;
}

/*
 * CRITICAL: Scroll-snap configuration for timeline navigation
 * ===========================================================
 * This scroll-snap CSS works with useScrollSnapNavigation composable which uses
 * scrollIntoView() for navigation. DO NOT change without understanding the full system.
 *
 * Related files:
 * - @/shared/composables/useScrollSnapNavigation.ts - Centralized scroll navigation
 * - FormStudioPage.vue - Sets up navigation with this container
 * - TimelineStepCard.vue - Has scroll-snap-align: center on .timeline-step
 *
 * Why mandatory snap:
 * - Provides Senja-like UX where steps "snap" to center
 * - Works WITH scrollIntoView() for keyboard navigation
 * - Allows manual scroll to naturally settle on steps
 *
 * Previous bug (2026-01): Using scrollTo() with manual position calculation
 * caused steps to "skip" during keyboard navigation due to scroll-snap conflicts.
 * Fixed by centralizing navigation in useScrollSnapNavigation.
 */
.timeline-scroll {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  scroll-padding: 10vh 0;
}
</style>
