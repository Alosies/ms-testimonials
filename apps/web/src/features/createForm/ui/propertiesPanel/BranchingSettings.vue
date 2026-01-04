<script setup lang="ts">
/**
 * Branching Settings - Enable conditional flow branching
 *
 * Displays when a rating step is selected. Allows users to enable
 * branching based on the rating threshold.
 */
import { computed, watch, ref } from 'vue';
import { Icon } from '@testimonials/icons';
import { Switch, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { FLOW_METADATA } from '@/entities/form';

const editor = useTimelineEditor();

// Local switch state - synced with editor state
const localSwitchState = ref(false);

// Sync from editor to local state
watch(() => editor.isBranchingEnabled.value, (newVal) => {
  localSwitchState.value = newVal;
}, { immediate: true });

const selectedStep = computed(() => editor.selectedStep.value);

// Only show for rating steps
const isRatingStep = computed(() => selectedStep.value?.stepType === 'rating');

const threshold = computed({
  get: () => String(editor.branchingConfig.value.threshold),
  set: (value: string) => {
    editor.setBranchingThreshold(parseInt(value, 10));
  },
});

function toggleBranching() {
  const newValue = !localSwitchState.value;
  localSwitchState.value = newValue;
  handleBranchingToggle(newValue);
}

function handleBranchingToggle(enabled: boolean) {
  if (!selectedStep.value) return;

  if (enabled) {
    editor.enableBranching(selectedStep.value.id, 4);
  } else {
    editor.disableBranching();
  }
}
</script>

<template>
  <div v-if="isRatingStep" class="branching-settings">
    <div class="flex items-center gap-2 mb-3">
      <Icon icon="mdi:source-branch" class="w-4 h-4 text-primary" />
      <h4 class="text-sm font-semibold">Conditional Branching</h4>
    </div>

    <p class="text-xs text-muted-foreground mb-4">
      Show different follow-up steps based on the rating response.
    </p>

    <!-- Enable Toggle -->
    <div class="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 mb-3">
      <Label for="branching-toggle" class="text-sm cursor-pointer">
        Enable branching
      </Label>
      <Switch
        id="branching-toggle"
        :checked="localSwitchState"
        @click="toggleBranching"
      />
    </div>

    <!-- Threshold selector (only when enabled) -->
    <div v-if="localSwitchState" class="space-y-3">
      <div class="flex items-center justify-between">
        <Label class="text-sm">Threshold</Label>
        <Select v-model="threshold">
          <SelectTrigger class="w-24 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 stars</SelectItem>
            <SelectItem value="3">3 stars</SelectItem>
            <SelectItem value="4">4 stars</SelectItem>
            <SelectItem value="5">5 stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="text-xs text-muted-foreground space-y-1">
        <div class="flex items-center gap-2">
          <Icon :icon="FLOW_METADATA.testimonial.icon" class="w-4 h-4" :class="FLOW_METADATA.testimonial.colorClass" />
          <span>Rating &ge; {{ threshold }}: Testimonial flow</span>
        </div>
        <div class="flex items-center gap-2">
          <Icon :icon="FLOW_METADATA.improvement.icon" class="w-4 h-4" :class="FLOW_METADATA.improvement.colorClass" />
          <span>Rating &lt; {{ threshold }}: Improvement flow</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.branching-settings {
  padding: 1rem;
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  background: hsl(var(--card));
}
</style>
