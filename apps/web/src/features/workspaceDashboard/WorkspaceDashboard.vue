<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useCurrentContextStore } from '@/shared/currentContext';
import { useDashboardStats } from './composables';
import {
  DashboardHeader,
  DashboardStats,
  QuickActions,
  FormsOverview,
  RecentTestimonials,
  PendingApprovals,
  WidgetsOverview,
  SetupCallout,
} from './ui';

const contextStore = useCurrentContextStore();
const { currentOrganizationId, isLoading: isContextLoading } = toRefs(contextStore);

const statsVariables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));

const { stats, isLoading: isStatsLoading } = useDashboardStats(statsVariables);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <DashboardHeader />

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Setup Callout (shows when organization setup is pending for admin users) -->
      <div class="mb-6">
        <SetupCallout />
      </div>

      <!-- Stats -->
      <div class="mb-8">
        <DashboardStats :stats="stats" :is-loading="isStatsLoading || isContextLoading" />
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <QuickActions />
      </div>

      <!-- Main Grid: 2/3 + 1/3 Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Column (2/3) -->
        <div class="lg:col-span-2 space-y-8">
          <FormsOverview />
          <RecentTestimonials />
        </div>

        <!-- Sidebar Column (1/3) -->
        <div class="space-y-8">
          <PendingApprovals />
          <WidgetsOverview />
        </div>
      </div>
    </div>
  </div>
</template>
