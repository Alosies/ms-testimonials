<script setup lang="ts">
/**
 * Form responses page - displays analytics sessions for a form
 * Route: /:org/forms/:urlSlug/responses
 */
import { definePage } from 'unplugin-vue-router/runtime';
import { useRoute } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { Button } from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import AuthLayout from '@/layouts/AuthLayout.vue';
import { extractEntityIdFromSlug } from '@/shared/urls';
import { useGetFormAnalyticsEvents } from '@/entities/formAnalyticsEvent';
import {
  FormResponsesTable,
  FormResponsesTableSkeleton,
  FormResponsesEmptyState,
  FormResponsesTimeline,
  useFormResponsesTableState,
  aggregateBySession,
} from '@/features/formResponses';
import type { SessionStatus, AggregatedSession } from '@/features/formResponses';

definePage({
  meta: {
    requiresAuth: true,
  },
});

const route = useRoute();

const urlSlug = computed(() => route.params.urlSlug as string);
const entityInfo = computed(() => extractEntityIdFromSlug(urlSlug.value));
const formId = computed(() => entityInfo.value?.entityId ?? null);

// Fetch analytics events
const queryVariables = computed(() => ({
  formId: formId.value ?? '',
  limit: 1000,
}));

const { events, loading, isLoading, error, refetch } = useGetFormAnalyticsEvents(queryVariables);

// Aggregate events by session
const sessions = computed(() => aggregateBySession(events.value));

// Table state
const {
  statusFilter,
  sortColumn,
  sortDirection,
  filteredAndSortedSessions,
  hasFilteredSessions,
  toggleSort,
  setStatusFilter,
} = useFormResponsesTableState(sessions);

// Selected session for timeline
const selectedSessionId = ref<string | null>(null);

const selectedSession = computed<AggregatedSession | null>(() => {
  if (!selectedSessionId.value) return null;
  return sessions.value.find((s) => s.sessionId === selectedSessionId.value) ?? null;
});

// Auto-select first session when sessions load or change
watch(
  () => sessions.value,
  (newSessions) => {
    if (newSessions.length > 0 && !selectedSessionId.value) {
      // Select the most recent session (first in the list since sorted by lastActivity desc)
      selectedSessionId.value = newSessions[0].sessionId;
    }
  },
  { immediate: true }
);

const handleSelectSession = (session: AggregatedSession) => {
  selectedSessionId.value = session.sessionId;
};

// Status filter options
const statusOptions: Array<{ value: SessionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'abandoned', label: 'Abandoned' },
];
</script>

<template>
  <AuthLayout>
    <div class="p-6 h-full">
      <!-- Error state -->
      <div v-if="!entityInfo?.isValid" class="text-red-600">
        Invalid form URL
      </div>

      <!-- Main content -->
      <div v-else class="h-full flex flex-col">
        <!-- Header -->
        <div class="flex-shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 class="text-2xl font-semibold text-foreground">Responses</h1>
            <p class="mt-1 text-sm text-muted-foreground">
              View form submission sessions and analytics
            </p>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="refetch()"
              :disabled="loading"
            >
              <Icon
                icon="heroicons:arrow-path"
                class="h-4 w-4 mr-2"
                :class="{ 'animate-spin': loading }"
              />
              Refresh
            </Button>
          </div>
        </div>

        <!-- Error state -->
        <div v-if="error" class="rounded-lg border border-destructive/20 bg-destructive/10 p-4 mb-6">
          <p class="text-sm text-destructive">
            Failed to load responses: {{ error.message }}
          </p>
        </div>

        <!-- Loading state -->
        <template v-else-if="isLoading">
          <FormResponsesTableSkeleton />
        </template>

        <!-- Empty state -->
        <template v-else-if="sessions.length === 0">
          <FormResponsesEmptyState />
        </template>

        <!-- Table with timeline (2:1 split) -->
        <template v-else>
          <!-- Filters -->
          <div class="flex-shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <!-- Status filter tabs -->
            <div class="flex gap-1 p-1 bg-muted rounded-lg">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                :class="[
                  statusFilter === option.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                @click="setStatusFilter(option.value)"
              >
                {{ option.label }}
              </button>
            </div>

            <!-- Session count -->
            <div class="text-sm text-muted-foreground">
              {{ filteredAndSortedSessions.length }} of {{ sessions.length }} sessions
            </div>
          </div>

          <!-- 2:1 Split Layout -->
          <div class="flex-1 min-h-0 flex gap-6">
            <!-- Table (2/3 width) -->
            <div class="flex-[2] min-w-0 overflow-auto">
              <template v-if="hasFilteredSessions">
                <FormResponsesTable
                  :sessions="filteredAndSortedSessions"
                  :sort-column="sortColumn"
                  :sort-direction="sortDirection"
                  :selected-session-id="selectedSessionId"
                  @sort="toggleSort"
                  @select-session="handleSelectSession"
                />
              </template>

              <!-- No results for filter -->
              <template v-else>
                <div class="rounded-xl border border-border bg-card p-8 text-center">
                  <Icon icon="heroicons:funnel" class="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p class="text-sm text-muted-foreground">
                    No sessions match the current filter
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="mt-3"
                    @click="setStatusFilter('all')"
                  >
                    Clear filter
                  </Button>
                </div>
              </template>
            </div>

            <!-- Timeline (1/3 width) -->
            <div class="flex-1 min-w-0 hidden lg:block">
              <div class="sticky top-0 max-h-[calc(100vh-12rem)] rounded-xl border border-border bg-card p-4 flex flex-col overflow-hidden">
                <FormResponsesTimeline :session="selectedSession" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </AuthLayout>
</template>
