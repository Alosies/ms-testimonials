import { reactive, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type {
  ConfirmationActionType,
  ConfirmationMessage,
  ConfirmationOptions,
  BlockedMessageOptions,
} from '../models';

interface ConfirmationModalState {
  visible: boolean;
  actionType: ConfirmationActionType;
  entityName: string;
  isLoading: boolean;
  isBlocked: boolean;
  onConfirm: () => void | Promise<void>;
  customMessage: Partial<ConfirmationMessage> | null;
}

function _useConfirmationModal() {
  const modalState = reactive<ConfirmationModalState>({
    visible: false,
    actionType: 'custom',
    entityName: '',
    isLoading: false,
    isBlocked: false,
    onConfirm: () => {},
    customMessage: null,
  });

  const showConfirmation = (options: ConfirmationOptions) => {
    modalState.actionType = options.actionType;
    modalState.entityName = options.entityName;
    modalState.onConfirm = options.onConfirm;
    modalState.customMessage = options.customMessage || null;
    modalState.isLoading = false;
    modalState.isBlocked = false;
    modalState.visible = true;
  };

  /**
   * Show an info-only modal for blocked actions.
   * These modals have a single "Got it" button instead of Cancel + Confirm.
   */
  const showBlockedMessage = (options: BlockedMessageOptions) => {
    modalState.actionType = options.actionType;
    modalState.entityName = options.entityName;
    modalState.onConfirm = () => {};
    modalState.customMessage = options.customMessage || null;
    modalState.isLoading = false;
    modalState.isBlocked = true;
    modalState.visible = true;
  };

  const handleConfirm = async () => {
    try {
      modalState.isLoading = true;
      await modalState.onConfirm();
      modalState.visible = false;
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Keep modal open on error so user can retry
    } finally {
      modalState.isLoading = false;
    }
  };

  const handleCancel = () => {
    modalState.visible = false;
    modalState.isLoading = false;
    modalState.isBlocked = false;
  };

  const handleUpdateVisible = (value: boolean) => {
    modalState.visible = value;
    if (!value) {
      modalState.isLoading = false;
      modalState.isBlocked = false;
    }
  };

  return {
    // State (readonly)
    modalState: readonly(modalState),

    // Actions
    showConfirmation,
    showBlockedMessage,
    handleConfirm,
    handleCancel,
    handleUpdateVisible,
  };
}

// Create shared composable that maintains global state
export const useConfirmationModal = createSharedComposable(_useConfirmationModal);
