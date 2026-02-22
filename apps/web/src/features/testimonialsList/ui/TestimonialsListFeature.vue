<script setup lang="ts">
import { computed, ref, watch, toRefs } from 'vue';
import { Icon } from '@testimonials/icons';
import { Button, Input } from '@testimonials/ui';
import { useToast } from '@testimonials/ui';
import { useCurrentContextStore } from '@/shared/currentContext/store';
import { useRouting } from '@/shared/routing';
import {
  useGetTestimonialsWithForm,
  useGetFormTestimonials,
  useGetTestimonialsStats,
  useGetFormTestimonialsStats,
  useApproveTestimonial,
  useRejectTestimonial,
} from '@/entities/testimonial';
import { useTestimonialsListState, STATUS_OPTIONS } from '../composables/useTestimonialsListState';
import TestimonialCard from './TestimonialCard.vue';
import TestimonialDetailPanel from './TestimonialDetailPanel.vue';
import TestimonialsEmptyState from './TestimonialsEmptyState.vue';
import TestimonialsCardSkeleton from './TestimonialsCardSkeleton.vue';
import RejectTestimonialModal from './RejectTestimonialModal.vue';

interface Props {
  formId?: string;
}

const props = defineProps<Props>();

const contextStore = useCurrentContextStore();
const { currentOrganizationId, currentUserId } = toRefs(contextStore);
const { goToForms } = useRouting();
const { toast } = useToast();

// Query variables
const orgVariables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
}));

const formVariables = computed(() => ({
  organizationId: currentOrganizationId.value ?? '',
  formId: props.formId ?? '',
}));

// Use appropriate query based on context
const orgQuery = useGetTestimonialsWithForm(orgVariables);
const formQuery = useGetFormTestimonials(formVariables);

const testimonials = computed(() =>
  props.formId ? formQuery.testimonials.value : orgQuery.testimonials.value,
);
const isLoading = computed(() =>
  props.formId ? formQuery.isLoading.value : orgQuery.isLoading.value,
);
const refetchTestimonials = () => {
  if (props.formId) {
    formQuery.refetch();
  } else {
    orgQuery.refetch();
  }
};

// Stats
const orgStats = useGetTestimonialsStats(orgVariables);
const formStats = useGetFormTestimonialsStats(formVariables);

const stats = computed(() =>
  props.formId ? formStats.stats.value : orgStats.stats.value,
);
const statsLoading = computed(() =>
  props.formId ? formStats.loading.value : orgStats.loading.value,
);

// State management
const {
  statusFilter,
  searchQuery,
  sortOption,
  selectedTestimonialId,
  filteredTestimonials,
  selectedTestimonial,
  hasFilteredResults,
  setStatusFilter,
  selectTestimonial,
} = useTestimonialsListState(testimonials);

// Auto-select first testimonial
watch(
  () => filteredTestimonials.value,
  (newList) => {
    if (newList.length > 0 && !selectedTestimonialId.value) {
      selectedTestimonialId.value = newList[0].id;
    }
  },
  { immediate: true },
);

// Mutations
const { approveTestimonial } = useApproveTestimonial();
const { rejectTestimonial } = useRejectTestimonial();

// Reject modal state
const rejectModalOpen = ref(false);
const rejectTargetId = ref('');

function openRejectModal(id: string) {
  rejectTargetId.value = id;
  rejectModalOpen.value = true;
}

function closeRejectModal() {
  rejectModalOpen.value = false;
  rejectTargetId.value = '';
}

async function handleApprove(id: string) {
  if (!currentUserId.value) return;
  const result = await approveTestimonial(id, currentUserId.value);
  if (result) {
    toast({ title: 'Testimonial approved' });
    refetchTestimonials();
  } else {
    toast({ title: 'Failed to approve testimonial', variant: 'destructive' });
  }
}

async function handleReject(id: string, reason: string) {
  if (!currentUserId.value) return;
  closeRejectModal();
  const result = await rejectTestimonial(id, currentUserId.value, reason || undefined);
  if (result) {
    toast({ title: 'Testimonial rejected' });
    refetchTestimonials();
  } else {
    toast({ title: 'Failed to reject testimonial', variant: 'destructive' });
  }
}

const statusOptions = STATUS_OPTIONS;

function getStatusCount(value: string): number | null {
  if (statsLoading.value || !stats.value) return null;
  switch (value) {
    case 'all': return stats.value.total;
    case 'pending': return stats.value.pending;
    case 'approved': return stats.value.approved;
    case 'rejected': return stats.value.rejected;
    default: return null;
  }
}
</script>

<template>
  <!-- Filters row -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
    <!-- Status filter tabs with counts -->
    <div class="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
      <button
        v-for="option in statusOptions"
        :key="option.value"
        class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
        :class="[
          statusFilter === option.value
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="setStatusFilter(option.value)"
      >
        {{ option.label }}
        <span
          v-if="getStatusCount(option.value) !== null"
          class="text-xs tabular-nums rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center"
          :class="[
            statusFilter === option.value
              ? 'bg-muted text-muted-foreground'
              : 'bg-background/60 text-muted-foreground',
          ]"
        >
          {{ getStatusCount(option.value) }}
        </span>
      </button>
    </div>

    <!-- Search + sort -->
    <div class="flex items-center gap-2">
      <div class="relative">
        <Icon icon="heroicons:magnifying-glass" class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search testimonials..."
          class="pl-8 w-48"
        />
      </div>
      <select
        v-model="sortOption"
        class="h-9 rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="highest_rated">Highest Rated</option>
      </select>
    </div>
  </div>

  <!-- Loading state -->
  <TestimonialsCardSkeleton v-if="isLoading" />

  <!-- Empty state -->
  <TestimonialsEmptyState
    v-else-if="testimonials.length === 0"
    :context="formId ? 'form' : 'org'"
    @navigate-to-forms="goToForms()"
  />

  <!-- Content: 2:1 split -->
  <template v-else>
    <div class="flex gap-6">
      <!-- Card list (2/3) -->
      <div class="flex-[2] min-w-0 space-y-3">
        <template v-if="hasFilteredResults">
          <TestimonialCard
            v-for="t in filteredTestimonials"
            :key="t.id"
            :testimonial="t"
            :is-selected="t.id === selectedTestimonialId"
            :show-form-attribution="!formId"
            @select="selectTestimonial"
            @approve="handleApprove"
            @reject="openRejectModal"
          />
        </template>

        <!-- No filter results -->
        <div v-else class="rounded-xl border border-border bg-card p-8 text-center">
          <Icon icon="heroicons:funnel" class="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p class="text-sm text-muted-foreground">
            No testimonials match the current filters
          </p>
          <Button
            variant="ghost"
            size="sm"
            class="mt-3"
            @click="setStatusFilter('all'); searchQuery = '';"
          >
            Clear filters
          </Button>
        </div>
      </div>

      <!-- Detail panel (1/3, lg+ only) -->
      <div class="flex-1 min-w-0 hidden lg:block">
        <div class="sticky top-0 max-h-[calc(100vh-12rem)] rounded-xl border border-border bg-card p-4">
          <TestimonialDetailPanel
            :testimonial="selectedTestimonial"
            @approve="handleApprove"
            @reject="openRejectModal"
          />
        </div>
      </div>
    </div>
  </template>

  <!-- Reject modal -->
  <RejectTestimonialModal
    :is-open="rejectModalOpen"
    :testimonial-id="rejectTargetId"
    @confirm="handleReject"
    @cancel="closeRejectModal"
  />
</template>
