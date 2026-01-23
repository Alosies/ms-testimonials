<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@testimonials/icons';
import type { AggregatedSession, VisitorInfo } from '../models';
import { calculateDuration } from '../functions/getDuration';
import {
  getEventConfig,
  formatTime,
  formatDate,
  formatStepInfo,
  extractVisitorInfo,
} from '../functions/timelineHelpers';

const props = defineProps<{
  session: AggregatedSession | null;
}>();

// Sort events chronologically (oldest first for timeline)
const sortedEvents = computed(() => {
  if (!props.session) return [];
  return [...props.session.events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
});

// Calculate total duration from first to last event
const duration = computed(() => {
  if (!props.session || sortedEvents.value.length < 2) return null;

  const firstEvent = sortedEvents.value[0];
  const lastEvent = sortedEvents.value[sortedEvents.value.length - 1];

  return calculateDuration(firstEvent.created_at, lastEvent.created_at);
});

// Extract visitor info from form_started or form_resumed event
const visitorInfo = computed<VisitorInfo | null>(() => {
  if (!props.session) return null;
  return extractVisitorInfo(sortedEvents.value);
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 pb-4 border-b border-border">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-medium text-foreground">Session Timeline</h3>
        <div v-if="session" class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{{ session.eventCount }} events</span>
          <template v-if="duration">
            <span class="w-px h-3 bg-border" />
            <span>{{ duration }}</span>
          </template>
          <span class="w-px h-3 bg-border" />
          <span class="capitalize">{{ session.status.replace('_', ' ') }}</span>
        </div>
      </div>
      <p v-if="session" class="text-xs text-muted-foreground mt-1 font-mono">
        {{ session.sessionId.slice(0, 8) }}...
      </p>
    </div>

    <!-- Empty state -->
    <div v-if="!session" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <Icon icon="heroicons:clock" class="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
        <p class="text-sm text-muted-foreground">Select a session to view timeline</p>
      </div>
    </div>

    <!-- Timeline -->
    <div v-else class="flex-1 overflow-y-auto pt-4">
      <!-- Visitor Info Card -->
      <div v-if="visitorInfo" class="mb-4 p-3 rounded-lg bg-muted/50">
        <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <!-- Location -->
          <div v-if="visitorInfo.location" class="flex items-center gap-2 text-xs col-span-2">
            <Icon icon="heroicons:map-pin" class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span class="text-foreground truncate">{{ visitorInfo.location }}</span>
          </div>
          <!-- Local dev indicator when no geo data -->
          <div v-else-if="!visitorInfo.location && visitorInfo.device" class="flex items-center gap-2 text-xs col-span-2">
            <Icon icon="heroicons:map-pin" class="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            <span class="text-muted-foreground italic">Local/Private IP</span>
          </div>

          <!-- Device & Screen -->
          <div v-if="visitorInfo.device || visitorInfo.screenSize" class="flex items-center gap-2 text-xs">
            <Icon
              :icon="visitorInfo.device === 'Mobile' ? 'heroicons:device-phone-mobile' : 'heroicons:computer-desktop'"
              class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
            />
            <span class="text-foreground truncate">
              {{ visitorInfo.device }}
              <span v-if="visitorInfo.screenSize" class="text-muted-foreground">· {{ visitorInfo.screenSize }}</span>
            </span>
          </div>

          <!-- Language -->
          <div v-if="visitorInfo.language" class="flex items-center gap-2 text-xs">
            <Icon icon="heroicons:language" class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span class="text-foreground">{{ visitorInfo.language }}</span>
          </div>

          <!-- Timezone -->
          <div v-if="visitorInfo.timezone" class="flex items-center gap-2 text-xs">
            <Icon icon="heroicons:clock" class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span class="text-foreground truncate">{{ visitorInfo.timezone }}</span>
          </div>

          <!-- Referrer -->
          <div v-if="visitorInfo.referrer" class="flex items-center gap-2 text-xs">
            <Icon icon="heroicons:arrow-top-right-on-square" class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span class="text-foreground truncate">{{ visitorInfo.referrer }}</span>
          </div>

          <!-- ISP/Org (full width if present) -->
          <div v-if="visitorInfo.isp" class="flex items-center gap-2 text-xs col-span-2">
            <Icon icon="heroicons:building-office" class="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span class="text-muted-foreground truncate">{{ visitorInfo.isp }}</span>
          </div>
        </div>
      </div>

      <!-- Date header -->
      <div class="text-xs font-medium text-muted-foreground mb-3">
        {{ formatDate(sortedEvents[0]?.created_at) }}
      </div>

      <!-- Events -->
      <div class="relative">
        <!-- Vertical line -->
        <div class="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

        <!-- Event items -->
        <div class="space-y-4">
          <div
            v-for="event in sortedEvents"
            :key="event.id"
            class="relative flex gap-3"
          >
            <!-- Dot -->
            <div
              class="relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getEventConfig(event.event_type).bgClass"
            >
              <div
                class="w-2 h-2 rounded-full"
                :class="getEventConfig(event.event_type).dotClass"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pb-1">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-foreground">
                  {{ getEventConfig(event.event_type).label }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ formatTime(event.created_at) }}
                </span>
              </div>

              <!-- Step info -->
              <p v-if="formatStepInfo(event)" class="text-xs text-muted-foreground mt-0.5">
                {{ formatStepInfo(event) }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
