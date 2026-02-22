<script setup lang="ts">
/**
 * Testimonial detail view — full-page detail with approve/reject actions.
 * Used by the /:org/testimonials/:urlSlug page.
 * ADR-025 Phase 4.3
 */
import { computed, ref, toRefs } from 'vue';
import { useToast } from '@testimonials/ui';
import { useCurrentContextStore } from '@/shared/currentContext/store';
import {
  useGetTestimonial,
  useApproveTestimonial,
  useRejectTestimonial,
} from '@/entities/testimonial';
import TestimonialDetailPanel from './TestimonialDetailPanel.vue';
import RejectTestimonialModal from './RejectTestimonialModal.vue';

interface Props {
  testimonialId: string;
}

const props = defineProps<Props>();

const contextStore = useCurrentContextStore();
const { currentUserId } = toRefs(contextStore);
const { toast } = useToast();

const variables = computed(() => ({ testimonialId: props.testimonialId }));
const { testimonial, isLoading } = useGetTestimonial(variables);

// Mutations
const { approveTestimonial } = useApproveTestimonial();
const { rejectTestimonial } = useRejectTestimonial();

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
  } else {
    toast({ title: 'Failed to reject testimonial', variant: 'destructive' });
  }
}

defineExpose({ isLoading });
</script>

<template>
  <div v-if="isLoading" class="animate-pulse space-y-4">
    <div class="h-12 w-48 bg-muted rounded" />
    <div class="h-4 w-full bg-muted rounded" />
    <div class="h-4 w-3/4 bg-muted rounded" />
    <div class="h-4 w-1/2 bg-muted rounded" />
  </div>

  <div v-else class="rounded-xl border border-border bg-card p-6">
    <TestimonialDetailPanel
      :testimonial="testimonial"
      @approve="handleApprove"
      @reject="openRejectModal"
    />
  </div>

  <RejectTestimonialModal
    :is-open="rejectModalOpen"
    :testimonial-id="rejectTargetId"
    @confirm="handleReject"
    @cancel="closeRejectModal"
  />
</template>
