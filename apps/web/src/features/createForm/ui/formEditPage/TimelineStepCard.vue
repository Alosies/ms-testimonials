<script setup lang="ts">
/**
 * Timeline Step Card - Individual step card in the timeline
 *
 * Displays a step with header, content preview, and action buttons.
 */
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import type { FormStep } from '../../models';

defineProps<{
  step: FormStep;
  index: number;
  isActive: boolean;
  isLast: boolean;
}>();

const emit = defineEmits<{
  select: [index: number];
  edit: [index: number];
  remove: [index: number];
}>();

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
  <div
    :data-step-index="index"
    class="timeline-step"
    :class="{
      'timeline-step-active': isActive,
      'timeline-step-inactive': !isActive,
    }"
  >
    <div class="step-header">
      <span
        class="flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold"
        :class="{
          'bg-primary text-primary-foreground': isActive,
          'bg-muted text-muted-foreground': !isActive,
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
      :class="{ 'ring-2 ring-primary ring-offset-4': isActive }"
      @click="emit('select', index)"
    >
      <div
        class="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-background/90 backdrop-blur-sm px-2 py-1.5 shadow-sm border border-border/50 opacity-40 group-hover:opacity-100 transition-opacity duration-200"
      >
        <button
          class="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors"
          title="Edit step"
          @click.stop="emit('edit', index)"
        >
          <Icon icon="heroicons:pencil" class="h-4 w-4 text-muted-foreground" />
          <Kbd size="sm">E</Kbd>
        </button>
        <button
          class="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-destructive/10 transition-colors"
          title="Delete step"
          @click.stop="emit('remove', index)"
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

    <div v-if="!isLast" class="timeline-connector">
      <div class="connector-line" />
    </div>
  </div>
</template>

<style scoped>
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
</style>
