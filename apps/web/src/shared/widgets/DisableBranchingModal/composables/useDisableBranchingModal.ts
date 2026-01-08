import { reactive, readonly } from 'vue';
import { createSharedComposable } from '@vueuse/core';
import type {
  DisableBranchingChoice,
  DisableBranchingContext,
  DisableBranchingModalState,
  DisableBranchingOptions,
} from '../models';

const DEFAULT_CONTEXT: DisableBranchingContext = {
  testimonialStepCount: 0,
  improvementStepCount: 0,
};

function _useDisableBranchingModal() {
  const modalState = reactive<DisableBranchingModalState>({
    visible: false,
    context: { ...DEFAULT_CONTEXT },
    selectedChoice: 'keep-testimonial', // Default selection
    isLoading: false,
    onChoice: null,
  });

  const showDisableBranchingModal = (options: DisableBranchingOptions) => {
    modalState.context = { ...options.context };
    modalState.onChoice = options.onChoice;
    modalState.selectedChoice = 'keep-testimonial'; // Reset to default
    modalState.isLoading = false;
    modalState.visible = true;
  };

  const setSelectedChoice = (choice: DisableBranchingChoice) => {
    modalState.selectedChoice = choice;
  };

  const handleConfirm = async () => {
    if (!modalState.selectedChoice || !modalState.onChoice) return;

    try {
      modalState.isLoading = true;
      await modalState.onChoice(modalState.selectedChoice);
      modalState.visible = false;
    } catch (error) {
      console.error('Disable branching action failed:', error);
      // Keep modal open on error so user can retry
    } finally {
      modalState.isLoading = false;
    }
  };

  const handleCancel = () => {
    if (modalState.onChoice) {
      modalState.onChoice('cancel');
    }
    modalState.visible = false;
    modalState.isLoading = false;
  };

  const handleUpdateVisible = (value: boolean) => {
    modalState.visible = value;
    if (!value) {
      modalState.isLoading = false;
    }
  };

  return {
    // State (readonly)
    modalState: readonly(modalState),

    // Actions
    showDisableBranchingModal,
    setSelectedChoice,
    handleConfirm,
    handleCancel,
    handleUpdateVisible,
  };
}

// Create shared composable that maintains global state
export const useDisableBranchingModal = createSharedComposable(_useDisableBranchingModal);
