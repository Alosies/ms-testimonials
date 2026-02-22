<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button, Textarea } from '@testimonials/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@testimonials/ui';

interface Props {
  isOpen: boolean;
  testimonialId: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  confirm: [id: string, reason: string];
  cancel: [];
}>();

const reason = ref('');

// Reset reason when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) reason.value = '';
  },
);

function handleConfirm() {
  emit('confirm', props.testimonialId, reason.value);
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="(v: boolean) => { if (!v) emit('cancel') }">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Reject Testimonial</DialogTitle>
        <DialogDescription>
          Optionally provide a reason for rejecting this testimonial.
        </DialogDescription>
      </DialogHeader>

      <div class="py-4">
        <Textarea
          v-model="reason"
          placeholder="Rejection reason (optional)"
          class="min-h-[100px]"
        />
        <p class="text-xs text-muted-foreground mt-2">
          This is an internal note and won't be shared with the customer.
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('cancel')">
          Cancel
        </Button>
        <Button variant="destructive" @click="handleConfirm">
          Reject Testimonial
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
