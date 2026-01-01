<script setup lang="ts">
import { computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@testimonials/ui';
import { Icon } from '@testimonials/icons';
import { CONFIRMATION_MESSAGES, INTENT_STYLES } from '../constants';
import { useConfirmationModal } from '../composables';
import type { ConfirmationIntent } from '../models';

// Component connects to global state internally
const { modalState, handleConfirm, handleCancel, handleUpdateVisible } = useConfirmationModal();

const messages = computed(() => {
  // For custom action type, require custom messages
  if (modalState.actionType === 'custom') {
    return {
      title: modalState.customMessage?.title || 'Confirm Action',
      message: modalState.customMessage?.message || 'Are you sure?',
      confirmText: modalState.customMessage?.confirmText || 'Confirm',
      warningText: modalState.customMessage?.warningText || '',
      intent: (modalState.customMessage?.intent || 'info') as ConfirmationIntent,
    };
  }

  const defaultMessages = CONFIRMATION_MESSAGES[modalState.actionType];
  const custom = modalState.customMessage;

  return {
    title: custom?.title || defaultMessages.title,
    message: custom?.message || defaultMessages.message,
    confirmText: custom?.confirmText || defaultMessages.confirmText,
    warningText: custom?.warningText || defaultMessages.warningText || '',
    intent: custom?.intent || defaultMessages.intent,
  };
});

const styles = computed(() => INTENT_STYLES[messages.value.intent]);

// Warning icon for danger/warning, info icon for info intent
const iconName = computed(() => {
  if (messages.value.intent === 'info') {
    return 'lucide:info';
  }
  return 'lucide:alert-triangle';
});
</script>

<template>
  <Dialog :open="modalState.visible" @update:open="handleUpdateVisible">
    <DialogContent class="z-[60] sm:max-w-md" overlay-class="z-[60]">
      <DialogHeader>
        <!-- Icon -->
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          :class="styles.iconBg"
        >
          <Icon :icon="iconName" class="h-6 w-6" :class="styles.iconColor" />
        </div>

        <DialogTitle class="text-center">{{ messages.title }}</DialogTitle>
        <DialogDescription class="text-center">
          {{ messages.message }}
        </DialogDescription>
      </DialogHeader>

      <!-- Warning text with entity name -->
      <div
        v-if="messages.warningText && modalState.entityName"
        class="mt-2 rounded-lg border p-3"
        :class="[styles.warningBg, styles.warningBorder]"
      >
        <p class="text-center text-sm font-medium" :class="styles.warningText">
          <span class="font-bold">"{{ modalState.entityName }}"</span>
          {{ messages.warningText }}
        </p>
      </div>

      <DialogFooter class="mt-4 flex gap-3 sm:justify-center">
        <Button
          variant="outline"
          class="flex-1"
          :disabled="modalState.isLoading"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          class="flex-1"
          :class="styles.buttonClass"
          :disabled="modalState.isLoading"
          @click="handleConfirm"
        >
          <Icon
            v-if="modalState.isLoading"
            icon="lucide:loader-2"
            class="mr-1.5 h-4 w-4 animate-spin"
          />
          {{ modalState.isLoading ? styles.loadingText : messages.confirmText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
