<script setup lang="ts">
/**
 * Timeline Step Card - Individual step card in the timeline
 *
 * Displays a step with header, content preview, and action buttons.
 * Uses the SAME shared step card components as the public form for consistency.
 * Uses TimelineConnector for the interactive insert functionality.
 * Automatically scrolls into view when selected via keyboard navigation.
 */
import { type CSSProperties, type Component, ref, watch, nextTick } from 'vue';
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import type { FormStep } from '../../models';
import {
  type StepType,
  WelcomeStepCard,
  QuestionStepCard,
  RatingStepCard,
  ConsentStepCard,
  ContactInfoStepCard,
  RewardStepCard,
  ThankYouStepCard,
} from '@/shared/stepCards';
import { OrganizationLogo } from '@/entities/organization';
import TimelineConnector from './TimelineConnector.vue';

const props = defineProps<{
  step: FormStep;
  index: number;
  isActive: boolean;
  isLast: boolean;
  /** Custom CSS styles for card content (e.g., custom --primary color) */
  contentStyles?: CSSProperties;
  /** Logo URL to display in the top-left corner of the card */
  logoUrl?: string | null;
}>();

const emit = defineEmits<{
  select: [index: number];
  edit: [index: number];
  remove: [index: number];
  insert: [afterIndex: number, type: StepType];
}>();

const cardRef = ref<HTMLElement | null>(null);

// Scroll into view when this card becomes active (keyboard navigation)
watch(
  () => props.isActive,
  async (active) => {
    if (active && cardRef.value) {
      await nextTick();
      cardRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  },
  { immediate: true },
);

// Map step types to their shared card components
const stepCardComponents: Record<StepType, Component> = {
  welcome: WelcomeStepCard,
  question: QuestionStepCard,
  rating: RatingStepCard,
  consent: ConsentStepCard,
  contact_info: ContactInfoStepCard,
  reward: RewardStepCard,
  thank_you: ThankYouStepCard,
};

function handleInsert(type: StepType) {
  emit('insert', props.index, type);
}
</script>

<template>
  <div
    ref="cardRef"
    :data-step-index="index"
    class="timeline-step"
    :class="{
      'timeline-step-active': isActive,
      'timeline-step-inactive': !isActive,
    }"
  >
    <div class="step-header">
      <div class="flex items-center gap-3">
        <span
          class="flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold"
          :class="{
            'bg-amber-500 text-white': step.isModified,
            'bg-primary text-primary-foreground': isActive && !step.isModified,
            'bg-muted text-muted-foreground': !isActive && !step.isModified,
          }"
        >
          {{ index + 1 }}
        </span>
        <span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {{ step.stepType.replace('_', ' ') }}
        </span>
      </div>

      <!-- Auto-save handles saving - no unsaved badge needed -->
    </div>

    <div
      class="step-card group"
      :class="{
        'ring-2 ring-primary ring-offset-4': isActive,
      }"
      @click="emit('select', index)"
    >
      <!-- Logo in top-left corner -->
      <div
        v-if="logoUrl"
        class="absolute top-4 left-4 z-10"
      >
        <OrganizationLogo
          :logo-url="logoUrl"
          size="md"
          rounded
          :show-placeholder="false"
        />
      </div>

      <!-- Action buttons - faded until hover -->
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

      <!-- Card content using shared step card components (same as public form) -->
      <div class="step-card-content" :style="contentStyles" @click.stop>
        <component
          :is="stepCardComponents[step.stepType]"
          :step="step"
          mode="preview"
        />
      </div>
    </div>

    <!-- Connector with insert button -->
    <TimelineConnector
      v-if="!isLast"
      @insert="handleInsert"
    />
  </div>
</template>

<style scoped>
/*
 * CRITICAL: scroll-snap-align is required for keyboard navigation
 * ================================================================
 * This works with FormEditorLayout.vue's .timeline-scroll (scroll-snap-type: y mandatory)
 * and useScrollSnapNavigation which uses scrollIntoView({ block: 'center' }).
 *
 * The scroll-snap-align: center ensures that when scrollIntoView is called,
 * the browser snaps this element to the center of the viewport.
 *
 * DO NOT REMOVE scroll-snap-align without updating the scroll system.
 * @see FormEditorLayout.vue - Parent scroll container with scroll-snap-type
 * @see @/shared/composables/useScrollSnapNavigation - Centralized navigation
 */
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
  justify-content: space-between;
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
  overflow: visible;
  aspect-ratio: 16 / 10;
  display: flex;
  flex-direction: column;
}

/*
 * Override border color for modified steps.
 * Uses Tailwind's amber-400 color value directly to avoid @apply circular dependency.
 * The class .border-amber-400 is added dynamically in the template.
 */
.step-card.border-amber-400 {
  border-color: rgb(251 191 36);
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
</style>
