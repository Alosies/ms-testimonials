<script setup lang="ts">
/**
 * Branching Settings - Enable conditional flow branching
 *
 * Displays when a rating step is selected. Allows users to enable
 * branching based on the rating threshold.
 *
 * ADR-009 Phase 2: When disabling branching with existing branched steps,
 * shows a modal with options to keep testimonial, keep improvement, or delete all.
 */
import { computed, watch, ref } from 'vue';
import { Icon } from '@testimonials/icons';
import {
  Switch,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@testimonials/ui';
import { useTimelineEditor } from '../../composables/timeline';
import { useSaveLock } from '../../composables';
import { FLOW_METADATA } from '@/entities/form';
import { studioTestIds } from '@/shared/constants/testIds';

const editor = useTimelineEditor();
const { isLocked } = useSaveLock();

// Local switch state - synced with editor state
const localSwitchState = ref(false);

// Disable branching modal state
const showDisableModal = ref(false);

// Sync from editor to local state
watch(() => editor.isBranchingEnabled.value, (newVal) => {
  localSwitchState.value = newVal;
}, { immediate: true });

const selectedStep = computed(() => editor.selectedStep.value);

// Only show for rating steps
const isRatingStep = computed(() => selectedStep.value?.stepType === 'rating');

// Check if there are branched steps
const hasBranchedSteps = computed(() => {
  return editor.testimonialSteps.value.length > 0 || editor.improvementSteps.value.length > 0;
});

const testimonialStepCount = computed(() => editor.testimonialSteps.value.length);
const improvementStepCount = computed(() => editor.improvementSteps.value.length);

const threshold = computed({
  get: () => String(editor.branchingConfig.value.threshold),
  set: (value: string) => {
    editor.setBranchingThreshold(parseInt(value, 10));
  },
});

function handleBranchingToggle(enabled: boolean) {
  if (!selectedStep.value) return;

  if (enabled) {
    editor.enableBranching(selectedStep.value.id, 4);
  } else {
    // Show modal if there are branched steps
    if (hasBranchedSteps.value) {
      showDisableModal.value = true;
    } else {
      // No branched steps, just disable directly
      editor.disableBranching();
    }
  }
}

async function handleKeepTestimonial() {
  showDisableModal.value = false;
  // ADR-011: Use persistence method for immediate save
  await editor.disableBranchingKeepTestimonialWithPersist();
}

async function handleKeepImprovement() {
  showDisableModal.value = false;
  // ADR-011: Use persistence method for immediate save
  await editor.disableBranchingKeepImprovementWithPersist();
}

async function handleDeleteAll() {
  showDisableModal.value = false;
  // ADR-011: Use persistence method for immediate save
  await editor.disableBranchingDeleteAllWithPersist();
}

function handleCancelDisable() {
  showDisableModal.value = false;
  // Reset local state to match editor (keep branching enabled)
  localSwitchState.value = true;
}
</script>

<template>
  <div v-if="isRatingStep" class="branching-settings" :data-testid="studioTestIds.propertiesBranchingSettings">
    <div class="flex items-center gap-2 mb-3">
      <Icon icon="lucide:network" class="w-4 h-4 text-primary" />
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
        :model-value="localSwitchState"
        :disabled="isLocked"
        @update:model-value="handleBranchingToggle"
      />
    </div>

    <!-- Threshold selector (only when enabled) -->
    <div v-if="localSwitchState" class="space-y-3">
      <div class="flex items-center justify-between">
        <Label class="text-sm">Threshold</Label>
        <Select v-model="threshold" :disabled="isLocked">
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

    <!-- Disable Branching Modal -->
    <Dialog :open="showDisableModal" @update:open="(v: boolean) => !v && handleCancelDisable()">
      <DialogContent class="z-[60] sm:max-w-md" overlay-class="z-[60]">
        <DialogHeader>
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Icon icon="lucide:alert-triangle" class="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle class="text-center">Disable Branching</DialogTitle>
          <DialogDescription class="text-center">
            You have steps in both flows. What would you like to do with them?
          </DialogDescription>
        </DialogHeader>

        <div class="mt-4 space-y-2">
          <!-- Keep Testimonial Option -->
          <button
            class="w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
            @click="handleKeepTestimonial"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full" :class="FLOW_METADATA.testimonial.bgClass">
                <Icon :icon="FLOW_METADATA.testimonial.icon" class="h-4 w-4" :class="FLOW_METADATA.testimonial.colorClass" />
              </div>
              <div>
                <div class="font-medium text-sm">Keep Testimonial Steps</div>
                <div class="text-xs text-muted-foreground">
                  Keep {{ testimonialStepCount }} step{{ testimonialStepCount !== 1 ? 's' : '' }}, remove improvement flow
                </div>
              </div>
            </div>
          </button>

          <!-- Keep Improvement Option -->
          <button
            class="w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
            @click="handleKeepImprovement"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full" :class="FLOW_METADATA.improvement.bgClass">
                <Icon :icon="FLOW_METADATA.improvement.icon" class="h-4 w-4" :class="FLOW_METADATA.improvement.colorClass" />
              </div>
              <div>
                <div class="font-medium text-sm">Keep Improvement Steps</div>
                <div class="text-xs text-muted-foreground">
                  Keep {{ improvementStepCount }} step{{ improvementStepCount !== 1 ? 's' : '' }}, remove testimonial flow
                </div>
              </div>
            </div>
          </button>

          <!-- Delete All Option -->
          <button
            class="w-full p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left"
            @click="handleDeleteAll"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <Icon icon="lucide:trash-2" class="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div class="font-medium text-sm text-red-700">Delete All Branched Steps</div>
                <div class="text-xs text-red-600">
                  Remove all {{ testimonialStepCount + improvementStepCount }} branched steps
                </div>
              </div>
            </div>
          </button>
        </div>

        <DialogFooter class="mt-4">
          <Button variant="outline" class="w-full" @click="handleCancelDisable">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
