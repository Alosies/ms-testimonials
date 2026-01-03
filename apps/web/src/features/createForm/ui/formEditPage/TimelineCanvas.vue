<script setup lang="ts">
/**
 * Timeline Canvas - Senja-inspired scroll-snap timeline
 *
 * Displays step cards with zoom animations and connectors.
 * Uses shared timeline editor composable for state.
 */
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';

const editor = useTimelineEditor();

function getStepTitle(content: Record<string, unknown>): string {
  return (content.title as string) || 'Untitled Step';
}

function getStepDescription(content: Record<string, unknown>): string {
  return (content.subtitle as string)
    || (content.message as string)
    || (content.description as string)
    || 'Click to edit this step';
}
</script>

<template>
  <div class="timeline-container">
    <div class="timeline-spacer" />

    <div
      v-for="(step, index) in editor.steps.value"
      :key="step.id"
      :data-step-index="index"
      class="timeline-step"
      :class="{
        'timeline-step-active': index === editor.selectedIndex.value,
        'timeline-step-inactive': index !== editor.selectedIndex.value,
      }"
    >
      <div class="step-header">
        <span
          class="flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold"
          :class="{
            'bg-primary text-primary-foreground': index === editor.selectedIndex.value,
            'bg-muted text-muted-foreground': index !== editor.selectedIndex.value,
          }"
        >
          {{ index + 1 }}
        </span>
        <span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {{ step.stepType.replace('_', ' ') }}
        </span>
      </div>

      <div
        class="step-card group"
        :class="{ 'ring-2 ring-primary ring-offset-4': index === editor.selectedIndex.value }"
        @click="editor.selectStep(index)"
      >
        <div
          class="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-background/90 backdrop-blur-sm px-2 py-1.5 shadow-sm border border-border/50 opacity-40 group-hover:opacity-100 transition-opacity duration-200"
        >
          <button
            class="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors"
            title="Edit step"
            @click.stop="editor.handleEditStep(index)"
          >
            <Icon icon="heroicons:pencil" class="h-4 w-4 text-muted-foreground" />
            <Kbd size="sm">E</Kbd>
          </button>
          <button
            class="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-destructive/10 transition-colors"
            title="Delete step"
            @click.stop="editor.handleRemoveStep(index)"
          >
            <Icon icon="heroicons:trash" class="h-4 w-4 text-muted-foreground hover:text-destructive" />
            <Kbd size="sm">⌫</Kbd>
          </button>
        </div>

        <div class="step-card-content">
          <h3 class="text-3xl font-bold mb-4">
            {{ getStepTitle(step.content as Record<string, unknown>) }}
          </h3>
          <p class="text-xl text-muted-foreground max-w-lg leading-relaxed">
            {{ getStepDescription(step.content as Record<string, unknown>) }}
          </p>
        </div>
      </div>

      <div v-if="index < editor.steps.value.length - 1" class="timeline-connector">
        <div class="connector-line" />
      </div>
    </div>

    <div class="timeline-spacer" />

    <div v-if="editor.steps.value.length === 0" class="empty-state">
      <p class="mb-4">No steps yet. Add your first step to get started.</p>
      <button
        class="px-6 py-3 border-2 border-dashed rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-all flex items-center gap-2"
        @click="editor.handleAddStep('welcome')"
      >
        <span>Add Welcome Step</span>
        <Kbd size="sm">N</Kbd>
      </button>
    </div>
  </div>
</template>

<style scoped>
.timeline-container {
  padding: 0 2rem;
  max-width: 990px;
  margin: 0 auto;
}

.timeline-spacer {
  height: 15vh;
  scroll-snap-align: start;
}

.timeline-step {
  scroll-snap-align: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
  transform-origin: center center;
  margin-bottom: 1.5rem;
}

.timeline-step-active {
  transform: scale(1);
  opacity: 1;
}

.timeline-step-inactive {
  transform: scale(0.92);
  opacity: 0.5;
}

.timeline-step-inactive:hover {
  opacity: 0.7;
  transform: scale(0.94);
}

.step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
}

.step-card {
  position: relative;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 1rem;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.05),
    0 2px 4px -2px rgb(0 0 0 / 0.05),
    0 0 0 1px rgb(0 0 0 / 0.02);
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  display: flex;
  flex-direction: column;
}

.step-card:hover {
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
  border-color: hsl(var(--primary) / 0.4);
}

.step-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2.5rem;
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connector-line {
  width: 2px;
  height: 6rem;
  background: linear-gradient(
    to bottom,
    hsl(var(--border)),
    hsl(var(--muted-foreground) / 0.3),
    hsl(var(--border))
  );
  border-radius: 1px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: hsl(var(--muted-foreground));
  scroll-snap-align: center;
}
</style>
