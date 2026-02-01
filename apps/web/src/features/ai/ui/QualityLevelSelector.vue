<script setup lang="ts">
/**
 * QualityLevelSelector
 *
 * Component for selecting AI quality level with credit cost display.
 * Displays available quality levels as selectable cards with credit costs,
 * and shows disabled state with upgrade hint for unavailable levels.
 *
 * @see ADR-023 AI Capabilities Plan Integration
 */
import { computed } from 'vue';
import { Badge } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

// ============================================================================
// Types
// ============================================================================

export interface QualityLevelOption {
  id: string;
  name: string;
  creditCost: number;
}

interface Props {
  availableQualityLevels: QualityLevelOption[];
  allQualityLevels?: QualityLevelOption[];
  disabled?: boolean;
}

// ============================================================================
// Props & Model
// ============================================================================

const props = withDefaults(defineProps<Props>(), {
  allQualityLevels: () => [],
  disabled: false,
});

const selectedId = defineModel<string>('selectedId');

// ============================================================================
// Computed
// ============================================================================

/**
 * Combined list of all quality levels with availability status.
 * If allQualityLevels is not provided, only shows available levels.
 */
const qualityLevelsWithStatus = computed(() => {
  const availableIds = new Set(props.availableQualityLevels.map((l) => l.id));

  // If allQualityLevels is provided, use it to show unavailable levels too
  if (props.allQualityLevels.length > 0) {
    return props.allQualityLevels.map((level) => ({
      ...level,
      isAvailable: availableIds.has(level.id),
    }));
  }

  // Otherwise, just show available levels
  return props.availableQualityLevels.map((level) => ({
    ...level,
    isAvailable: true,
  }));
});

// ============================================================================
// Methods
// ============================================================================

function selectLevel(levelId: string) {
  if (props.disabled) return;

  const level = qualityLevelsWithStatus.value.find((l) => l.id === levelId);
  if (level && level.isAvailable) {
    selectedId.value = levelId;
  }
}

function isSelected(levelId: string): boolean {
  return selectedId.value === levelId;
}

/**
 * Get display name for quality level.
 * Capitalizes first letter for display.
 */
function getDisplayName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Get icon for quality level based on name.
 */
function getQualityIcon(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('premium') || lowerName.includes('high')) {
    return 'lucide:sparkles';
  }
  if (lowerName.includes('standard') || lowerName.includes('medium')) {
    return 'lucide:zap';
  }
  return 'lucide:circle';
}
</script>

<template>
  <div
    data-testid="quality-level-selector"
    class="space-y-2"
    role="radiogroup"
    aria-label="Select AI quality level"
  >
    <button
      v-for="level in qualityLevelsWithStatus"
      :key="level.id"
      type="button"
      :data-testid="`quality-option-${level.id}`"
      class="group flex w-full items-center justify-between rounded-lg border-2 p-3 text-left transition-all"
      :class="[
        isSelected(level.id)
          ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
          : level.isAvailable && !disabled
            ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            : 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60',
      ]"
      :disabled="!level.isAvailable || disabled"
      :aria-checked="isSelected(level.id)"
      :aria-disabled="!level.isAvailable || disabled"
      role="radio"
      @click="selectLevel(level.id)"
    >
      <!-- Left side: Icon and name -->
      <div class="flex items-center gap-3">
        <!-- Radio indicator -->
        <div
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
          :class="[
            isSelected(level.id)
              ? 'border-teal-500 bg-teal-500'
              : level.isAvailable
                ? 'border-gray-300'
                : 'border-gray-200',
          ]"
        >
          <div
            v-if="isSelected(level.id)"
            class="h-2 w-2 rounded-full bg-white"
          />
        </div>

        <!-- Icon -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          :class="[
            isSelected(level.id)
              ? 'bg-teal-500 text-white'
              : level.isAvailable
                ? 'bg-gray-100 text-gray-500'
                : 'bg-gray-100 text-gray-400',
          ]"
        >
          <Icon :icon="getQualityIcon(level.name)" class="h-4 w-4" />
        </div>

        <!-- Name -->
        <span
          class="font-medium transition-colors"
          :class="[
            isSelected(level.id)
              ? 'text-teal-700'
              : level.isAvailable
                ? 'text-gray-900'
                : 'text-gray-400',
          ]"
        >
          {{ getDisplayName(level.name) }}
        </span>
      </div>

      <!-- Right side: Credit cost or upgrade badge -->
      <div class="flex items-center gap-2">
        <span
          v-if="level.isAvailable"
          data-testid="quality-credit-cost"
          class="text-sm"
          :class="isSelected(level.id) ? 'text-teal-600' : 'text-gray-500'"
        >
          {{ level.creditCost }} {{ level.creditCost === 1 ? 'credit' : 'credits' }}
        </span>

        <Badge
          v-else
          variant="secondary"
          class="cursor-pointer bg-amber-100 text-amber-700 hover:bg-amber-200"
        >
          <Icon icon="lucide:arrow-up-circle" class="h-3 w-3" />
          Upgrade
        </Badge>
      </div>
    </button>

    <!-- Helper text when no levels available -->
    <p
      v-if="qualityLevelsWithStatus.length === 0"
      class="text-sm text-gray-500"
    >
      No quality levels available for this capability.
    </p>
  </div>
</template>
