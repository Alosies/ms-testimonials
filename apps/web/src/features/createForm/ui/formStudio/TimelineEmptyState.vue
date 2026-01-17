<script setup lang="ts">
/**
 * Timeline Empty State - Shown when no steps exist
 *
 * Displays a ghost card preview with flow illustration and keyboard shortcuts.
 */
import { Icon } from '@testimonials/icons';
import { Kbd } from '@testimonials/ui';
import type { StepType } from '../../models';
import { studioTestIds } from '@/shared/constants/testIds';
import { usePlatform } from '@/shared/composables';

const { modifierKey } = usePlatform();

const emit = defineEmits<{
  addStep: [stepType: StepType];
}>();
</script>

<template>
  <div :data-testid="studioTestIds.canvasEmptyState" class="empty-state">
    <!-- Ghost card outline - represents what a step will look like -->
    <div class="empty-card-ghost">
      <div class="ghost-header">
        <span class="ghost-badge" />
        <span class="ghost-label" />
      </div>
      <div class="ghost-card">
        <!-- Decorative flow illustration -->
        <div class="ghost-illustration">
          <div class="flow-card flow-card-1">
            <div class="flow-card-line" />
            <div class="flow-card-line flow-card-line-short" />
          </div>
          <div class="flow-connector">
            <div class="flow-dot" />
            <div class="flow-line" />
            <div class="flow-dot" />
          </div>
          <div class="flow-card flow-card-2">
            <div class="flow-card-line" />
            <div class="flow-card-line flow-card-line-short" />
          </div>
          <div class="flow-connector">
            <div class="flow-dot" />
            <div class="flow-line" />
            <div class="flow-dot" />
          </div>
          <div class="flow-card flow-card-3">
            <div class="flow-card-icon">
              <Icon icon="heroicons:sparkles" class="h-5 w-5 text-primary/70" />
            </div>
          </div>
        </div>

        <div class="ghost-card-content">
          <p class="text-muted-foreground text-base mb-5">
            Design your testimonial collection flow
          </p>
          <button
            :data-testid="studioTestIds.canvasAddButton"
            class="px-5 py-2.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 font-medium"
            @click="emit('addStep', 'welcome')"
          >
            <Icon icon="heroicons:plus" class="h-4 w-4" />
            <span>Add Step</span>
            <Kbd size="sm" class="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">N</Kbd>
          </button>
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="shortcuts-hint">
      <div class="shortcuts-hint-row">
        <span class="flex items-center gap-1.5">
          <Kbd>N</Kbd>
          <span class="text-muted-foreground/70">New step</span>
        </span>
        <span class="flex items-center gap-1.5">
          <Kbd>E</Kbd>
          <span class="text-muted-foreground/70">Edit</span>
        </span>
        <span class="flex items-center gap-1.5">
          <Kbd>↑</Kbd><Kbd>↓</Kbd>
          <span class="text-muted-foreground/70">Navigate</span>
        </span>
        <span class="flex items-center gap-1.5">
          <Kbd>{{ modifierKey }}</Kbd><Kbd>D</Kbd>
          <span class="text-muted-foreground/70">Delete</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2rem;
  scroll-snap-align: start;
}

.empty-card-ghost {
  width: 100%;
}

.ghost-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
}

.ghost-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px dashed hsl(var(--border));
  background: hsl(var(--muted) / 0.3);
}

.ghost-label {
  width: 80px;
  height: 14px;
  border-radius: 4px;
  background: hsl(var(--muted) / 0.5);
}

.ghost-card {
  border: 2px dashed hsl(var(--border));
  border-radius: 1rem;
  aspect-ratio: 16 / 10;
  display: flex;
  flex-direction: column;
  background: hsl(var(--muted) / 0.15);
  transition: all 0.2s ease;
}

.ghost-card:hover {
  border-color: hsl(var(--primary) / 0.4);
  background: hsl(var(--primary) / 0.02);
}

.ghost-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem 2rem 2rem;
}

.ghost-illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2.5rem;
}

.flow-card {
  width: 120px;
  height: 80px;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary) / 0.06));
  border: 2px solid hsl(var(--primary) / 0.2);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.08);
}

.flow-card-1 {
  transform: translateY(12px);
  animation: float-card 4s ease-in-out infinite;
}

.flow-card-2 {
  transform: translateY(-6px);
  animation: float-card 4s ease-in-out infinite 1.3s;
}

.flow-card-3 {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.08));
  border: 2px dashed hsl(var(--primary) / 0.35);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(3px);
  animation: float-card 4s ease-in-out infinite 2.6s;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.08);
}

.flow-card-icon {
  width: 36px;
  height: 36px;
  background: hsl(var(--primary) / 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-card-line {
  height: 10px;
  background: hsl(var(--primary) / 0.2);
  border-radius: 5px;
}

.flow-card-line-short {
  width: 55%;
}

.flow-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.flow-dot {
  width: 8px;
  height: 8px;
  background: hsl(var(--primary) / 0.4);
  border-radius: 50%;
}

.flow-line {
  width: 3px;
  height: 28px;
  background: linear-gradient(to bottom, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.15));
  border-radius: 2px;
}

@keyframes float-card {
  0%, 100% {
    transform: translateY(var(--float-offset, 0px));
  }
  50% {
    transform: translateY(calc(var(--float-offset, 0px) - 6px));
  }
}

.flow-card-1 { --float-offset: 12px; }
.flow-card-2 { --float-offset: -6px; }
.flow-card-3 { --float-offset: 3px; }

.shortcuts-hint {
  margin-top: 1.5rem;
  padding: 0.625rem 1rem;
  background: hsl(var(--muted) / 0.3);
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--border) / 0.5);
}

.shortcuts-hint-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.8125rem;
}
</style>
