<script setup lang="ts">
/**
 * FormDashboard
 *
 * Main dashboard container composing all dashboard sections.
 */

import { ref, computed, type Ref } from 'vue';
import { RefreshCw, AlertTriangle } from 'lucide-vue-next';
import { Button } from '@testimonials/ui';
import type { Period } from '../models';
import { useFormDashboard } from '../composables/useFormDashboard';
import FormDashboardMetrics from './FormDashboardMetrics.vue';
import FormDashboardAudience from './FormDashboardAudience.vue';
import FormDashboardRatings from './FormDashboardRatings.vue';
import FormDashboardSkeleton from './FormDashboardSkeleton.vue';
import FormDashboardEmpty from './FormDashboardEmpty.vue';
import PeriodSelector from './PeriodSelector.vue';

interface Props {
  formId: string;
}

const props = defineProps<Props>();

// Period selector
const selectedPeriod = ref<Period>('30d');

// Convert props to refs for the composable
const formIdRef = computed(() => props.formId);

// Use the dashboard composable
const {
  isLoading,
  isFetching,
  isError,
  error,
  hasData,
  caveat,
  stats,
  audience,
  ratings,
  dashboard,
  refetch,
} = useFormDashboard(formIdRef as Ref<string>, selectedPeriod);
</script>

<template>
  <div class="space-y-6">
    <!-- Header with period selector -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-foreground">
          Analytics Dashboard
        </h2>
        <p v-if="caveat" class="mt-1 flex items-center gap-1.5 text-sm text-warning">
          <AlertTriangle class="h-4 w-4" />
          {{ caveat }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Period selector -->
        <PeriodSelector v-model="selectedPeriod" />

        <!-- Refresh button -->
        <Button
          variant="outline"
          size="icon"
          :disabled="isFetching"
          @click="refetch()"
        >
          <RefreshCw
            class="h-4 w-4"
            :class="{ 'animate-spin': isFetching }"
          />
        </Button>
      </div>
    </div>

    <!-- Loading state -->
    <Transition name="fade" mode="out-in">
      <FormDashboardSkeleton v-if="isLoading && !dashboard" key="skeleton" />

      <!-- Error state -->
      <div
        v-else-if="isError"
        key="error"
        class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center"
      >
        <p class="text-destructive">
          Failed to load dashboard data: {{ (error as Error)?.message || 'Unknown error' }}
        </p>
        <Button
          variant="link"
          class="mt-3 text-destructive"
          @click="refetch()"
        >
          Try again
        </Button>
      </div>

      <!-- Empty state -->
      <FormDashboardEmpty v-else-if="!hasData" key="empty" />

      <!-- Dashboard content -->
      <div v-else key="content" class="space-y-6">
        <!-- Key Metrics -->
        <FormDashboardMetrics
          :stats="stats"
          :ratings="ratings"
        />

        <!-- Audience & Ratings -->
        <div class="grid gap-6 lg:grid-cols-2">
          <FormDashboardAudience :audience="audience" />
          <FormDashboardRatings :ratings="ratings" />
        </div>

        <!-- Generated timestamp -->
        <p
          v-if="dashboard?.generatedAt"
          class="text-right text-xs text-muted-foreground"
        >
          Data generated at {{ new Date(dashboard.generatedAt).toLocaleString() }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
