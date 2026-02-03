<script setup lang="ts">
/**
 * Rate Limits Card
 *
 * Displays AI capability rate limits and current usage.
 * Part of ADR-023 AI Capabilities Plan Integration.
 */
import { Icon } from '@testimonials/icons';
import { Skeleton } from '@testimonials/ui';
import { useAIRateLimits } from '../composables';
import { creditTestIds } from '@/shared/constants/testIds';

const { limits, loading, error, refresh } = useAIRateLimits({ refreshInterval: 60000 });

function formatTimeUntil(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return 'Now';

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} hr`;
  return `${Math.ceil(diffMs / (1000 * 60 * 60 * 24))} days`;
}

function getProgressColor(used: number, limit: number | null): string {
  if (limit === null) return 'bg-emerald-500';
  const percent = (used / limit) * 100;
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getUsagePercent(used: number, limit: number | null): number {
  if (limit === null || limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}
</script>

<template>
  <div
    class="rounded-xl border border-border bg-card p-6"
    :data-testid="creditTestIds.rateLimitsSection"
  >
    <!-- Loading State -->
    <template v-if="loading && !limits">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Skeleton class="h-5 w-5 rounded" />
            <Skeleton class="h-6 w-24" />
          </div>
          <Skeleton class="h-6 w-20 rounded" />
        </div>
        <div class="p-4 rounded-lg bg-muted/50 space-y-3">
          <Skeleton class="h-5 w-40" />
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Skeleton class="h-3 w-12 mb-2" />
              <Skeleton class="h-1.5 w-full rounded-full" />
            </div>
            <div>
              <Skeleton class="h-3 w-12 mb-2" />
              <Skeleton class="h-1.5 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <div class="text-center py-8">
        <Icon
          icon="heroicons:exclamation-triangle"
          class="h-10 w-10 text-destructive mx-auto mb-3"
        />
        <p class="text-sm text-destructive mb-3">Failed to load rate limits</p>
        <button class="text-sm text-primary hover:underline" @click="refresh">
          Try again
        </button>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="limits">
      <div class="flex items-center gap-2 mb-4">
        <Icon icon="heroicons:shield-check" class="h-5 w-5 text-primary" />
        <h3 class="text-lg font-semibold text-foreground">Rate Limits</h3>
        <span
          class="ml-auto text-xs text-muted-foreground px-2 py-1 rounded bg-muted"
          :data-testid="creditTestIds.rateLimitPlanName"
        >
          {{ limits.planName }} Plan
        </span>
      </div>

      <!-- Empty State -->
      <div v-if="limits.capabilities.length === 0" class="text-center py-8 text-muted-foreground">
        <Icon icon="heroicons:sparkles" class="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">No AI capabilities enabled on your plan</p>
      </div>

      <!-- Capabilities List -->
      <div v-else class="space-y-4">
        <div
          v-for="cap in limits.capabilities"
          :key="cap.capabilityId"
          class="p-4 rounded-lg bg-muted/50"
        >
          <h4
            class="font-medium text-foreground mb-3"
            :data-testid="creditTestIds.rateLimitCapability"
          >
            {{ cap.capabilityName }}
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <!-- Hourly Limit -->
            <div :data-testid="creditTestIds.rateLimitHourly">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-muted-foreground">Hourly</span>
                <span class="text-xs font-medium text-foreground">
                  <template v-if="cap.hourlyLimit !== null">
                    {{ cap.usedThisHour }}/{{ cap.hourlyLimit }}
                  </template>
                  <span v-else class="text-muted-foreground">Unlimited</span>
                </span>
              </div>
              <div v-if="cap.hourlyLimit !== null" class="w-full h-1.5 rounded-full bg-muted">
                <div
                  :class="[getProgressColor(cap.usedThisHour, cap.hourlyLimit), 'h-1.5 rounded-full transition-all duration-300']"
                  :style="{ width: `${getUsagePercent(cap.usedThisHour, cap.hourlyLimit)}%` }"
                />
              </div>
              <div v-else class="w-full h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-900/50" />
              <p v-if="cap.hourlyResetsAt" class="text-[10px] text-muted-foreground mt-1">
                Resets in {{ formatTimeUntil(cap.hourlyResetsAt) }}
              </p>
            </div>

            <!-- Daily Limit -->
            <div :data-testid="creditTestIds.rateLimitDaily">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-muted-foreground">Daily</span>
                <span class="text-xs font-medium text-foreground">
                  <template v-if="cap.dailyLimit !== null">
                    {{ cap.usedToday }}/{{ cap.dailyLimit }}
                  </template>
                  <span v-else class="text-muted-foreground">Unlimited</span>
                </span>
              </div>
              <div v-if="cap.dailyLimit !== null" class="w-full h-1.5 rounded-full bg-muted">
                <div
                  :class="[getProgressColor(cap.usedToday, cap.dailyLimit), 'h-1.5 rounded-full transition-all duration-300']"
                  :style="{ width: `${getUsagePercent(cap.usedToday, cap.dailyLimit)}%` }"
                />
              </div>
              <div v-else class="w-full h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-900/50" />
              <p class="text-[10px] text-muted-foreground mt-1">
                Resets at midnight UTC
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Info note -->
      <p class="text-xs text-muted-foreground mt-4 flex items-start gap-1.5">
        <Icon icon="heroicons:information-circle" class="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>
          Rate limits reset independently of credit balance. Hourly limits use a sliding 60-minute window.
        </span>
      </p>
    </template>
  </div>
</template>
