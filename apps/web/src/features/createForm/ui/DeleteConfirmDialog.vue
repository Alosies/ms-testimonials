<script setup lang="ts">
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';

defineProps<{
  open: boolean;
  questionText: string;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [];
  cancel: [];
}>();

function handleCancel() {
  emit('cancel');
  emit('update:open', false);
}

function handleConfirm() {
  emit('confirm');
  emit('update:open', false);
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Icon icon="lucide:alert-triangle" class="h-6 w-6 text-red-600" />
        </div>
        <DialogTitle class="text-center">Delete Question?</DialogTitle>
        <DialogDescription class="text-center">
          Are you sure you want to delete this question? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2 rounded-lg border bg-gray-50 p-3">
        <p class="text-sm text-gray-700 line-clamp-2">
          "{{ questionText || 'Untitled question' }}"
        </p>
      </div>

      <DialogFooter class="mt-4 flex gap-3 sm:justify-center">
        <Button variant="outline" class="flex-1" @click="handleCancel">
          Cancel
        </Button>
        <Button
          variant="destructive"
          class="flex-1 bg-red-600 hover:bg-red-700"
          @click="handleConfirm"
        >
          <Icon icon="lucide:trash-2" class="mr-1.5 h-4 w-4" />
          Delete Question
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
