<script setup lang="ts">
/**
 * Flow Step Card - Compact step card for branched timeline view
 *
 * A more compact version of TimelineStepCard for use in side-by-side columns.
 * Automatically scrolls into view when selected via keyboard navigation.
 */
import { computed, ref, watch, nextTick } from 'vue';
import { Icon } from '@testimonials/icons';
import { FLOW_METADATA } from '@/entities/form';
import type { FlowMembership } from '@/shared/stepCards';
import type { FormStep } from '../../models';

const props = defineProps<{
  step: FormStep;
  flowIndex: number;
  isActive: boolean;
  isFocusedFlow: boolean;
  flowType: Exclude<FlowMembership, 'shared'>;
}>();

const emit = defineEmits<{
  select: [];
  edit: [];
  remove: [];
}>();

const cardRef = ref<HTMLElement | null>(null);

const metadata = computed(() => FLOW_METADATA[props.flowType]);

// Scroll into view when this card becomes active in the focused flow
watch(
  () => props.isActive && props.isFocusedFlow,
  async (isActiveInFocusedFlow) => {
    if (isActiveInFocusedFlow && cardRef.value) {
      await nextTick();
      cardRef.value.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  },
  { immediate: true },
);

function getStepTitle(): string {
  if ((props.step.stepType === 'question' || props.step.stepType === 'rating') && props.step.question) {
    return props.step.question.questionText || 'Untitled Question';
  }

  const content = props.step.content as Record<string, unknown>;
  return (content.title as string) || 'Untitled Step';
}

function getStepDescription(): string {
  if ((props.step.stepType === 'question' || props.step.stepType === 'rating') && props.step.question) {
    const typeName = props.step.question.questionType?.uniqueName || 'text';
    return `${typeName} response`;
  }

  const content = props.step.content as Record<string, unknown>;
  return (content.subtitle as string)
    || (content.message as string)
    || (content.description as string)
    || 'Click to edit';
}
</script>

<template>
  <div
    ref="cardRef"
    class="flow-step-card group"
    :class="{
      'flow-step-card-active': isActive && isFocusedFlow,
      'flow-step-card-inactive': !isActive || !isFocusedFlow,
      [metadata.borderClass]: isActive && isFocusedFlow,
    }"
    @click="emit('select')"
  >
    <!-- Step number badge -->
    <div
      class="step-badge"
      :class="{
        [metadata.bgClass]: isActive && isFocusedFlow,
        [metadata.colorClass]: isActive && isFocusedFlow,
        'bg-muted text-muted-foreground': !isActive || !isFocusedFlow,
      }"
    >
      {{ flowIndex + 1 }}
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <span
          class="text-xs font-medium uppercase tracking-wider"
          :class="{
            [metadata.colorClass]: isActive && isFocusedFlow,
            'text-muted-foreground': !isActive || !isFocusedFlow,
          }"
        >
          {{ step.stepType.replace('_', ' ') }}
        </span>
      </div>
      <h4 class="font-semibold text-sm truncate">
        {{ getStepTitle() }}
      </h4>
      <p class="text-xs text-muted-foreground truncate">
        {{ getStepDescription() }}
      </p>
    </div>

    <!-- Actions -->
    <div
      class="step-actions opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        class="p-1.5 rounded-md hover:bg-muted transition-colors"
        title="Edit step"
        @click.stop="emit('edit')"
      >
        <Icon icon="heroicons:pencil" class="w-4 h-4 text-muted-foreground" />
      </button>
      <button
        class="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
        title="Delete step"
        @click.stop="emit('remove')"
      >
        <Icon icon="heroicons:trash" class="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.flow-step-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  scroll-snap-align: center;
}

.flow-step-card-active {
  border-width: 2px;
  box-shadow: 0 4px 12px -2px rgb(0 0 0 / 0.1);
}

.flow-step-card-inactive {
  opacity: 0.7;
}

.flow-step-card-inactive:hover {
  opacity: 0.9;
  border-color: hsl(var(--border));
}

.step-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.step-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}
</style>
