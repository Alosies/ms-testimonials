<script setup lang="ts">
import { computed } from 'vue';
import {
  Button,
  SheetTitle,
  SheetDescription,
} from '@testimonials/ui';
import { VisuallyHidden } from 'reka-ui';
import { Icon } from '@testimonials/icons';
import { SaveStatusPill, type SaveStatus } from '@/shared/widgets';

const props = defineProps<{
  /** Whether in edit mode (vs add mode) */
  isEditMode: boolean;
  /** Current question index (edit mode) */
  questionIndex: number;
  /** Total number of questions (edit mode) */
  totalQuestions: number;
  /** Whether question has unsaved changes (edit mode) */
  isDirty: boolean;
  /** Whether save is in progress (edit mode) */
  isSaving: boolean;
  /** Whether save just completed (edit mode) */
  justSaved: boolean;
  /** Whether keyboard navigation is enabled (edit mode) */
  isNavigationEnabled: boolean;
  /** Whether device has keyboard (edit mode) */
  hasKeyboard: boolean;
  /** Whether form is valid for submission (add mode) */
  isValid: boolean;
}>();

const emit = defineEmits<{
  navigate: [direction: 'prev' | 'next'];
  delete: [];
  close: [];
  add: [];
  save: [];
  headerKeydown: [event: KeyboardEvent];
  enableNavigation: [];
  disableNavigation: [];
}>();

// Compute save status from individual props
const saveStatus = computed<SaveStatus>(() => {
  if (props.justSaved) return 'saved';
  if (props.isSaving) return 'saving';
  if (props.isDirty) return 'unsaved';
  return 'idle';
});
</script>

<template>
  <!-- Edit Mode Header -->
  <div
    v-if="isEditMode"
    :tabindex="hasKeyboard ? 0 : -1"
    :class="[
      'flex items-center justify-between border-b bg-gray-50 px-6 py-4 outline-none transition-colors',
      hasKeyboard && 'cursor-pointer focus:bg-gray-100',
    ]"
    @keydown="emit('headerKeydown', $event)"
    @focus="emit('enableNavigation')"
    @blur="emit('disableNavigation')"
  >
    <div class="flex items-center gap-3">
      <!-- Navigation Arrows -->
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          :disabled="questionIndex <= 0"
          tabindex="-1"
          @click="emit('navigate', 'prev')"
        >
          <Icon icon="lucide:chevron-up" class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          :disabled="questionIndex >= totalQuestions - 1"
          tabindex="-1"
          @click="emit('navigate', 'next')"
        >
          <Icon icon="lucide:chevron-down" class="h-4 w-4" />
        </Button>
      </div>

      <div>
        <SheetTitle class="text-base font-semibold text-gray-900">
          Question {{ questionIndex + 1 }} of {{ totalQuestions }}
        </SheetTitle>
        <VisuallyHidden>
          <SheetDescription>
            Edit question settings including text, type, and options
          </SheetDescription>
        </VisuallyHidden>
        <!-- Keyboard navigation hint - only shown on devices with keyboards -->
        <p
          v-if="hasKeyboard"
          :class="[
            'text-xs transition-colors',
            isNavigationEnabled
              ? 'font-medium text-primary'
              : 'text-gray-500',
          ]"
        >
          <span v-if="isNavigationEnabled" class="inline-flex items-center gap-1">
            <Icon icon="lucide:keyboard" class="h-3 w-3" />
            Keyboard ↑↓ navigation active
          </span>
          <span v-else>Click here to enable Keyboard ↑↓ navigation</span>
        </p>
      </div>
    </div>

    <!-- Edit Mode Actions -->
    <div class="flex items-center gap-2">
      <!-- Save status pill -->
      <SaveStatusPill
        :status="saveStatus"
        @save="emit('save')"
      />

      <!-- Divider when status is visible -->
      <div
        v-if="saveStatus !== 'idle'"
        class="h-6 w-px bg-gray-200"
      />

      <Button
        variant="ghost"
        size="sm"
        class="text-red-500 hover:bg-red-50 hover:text-red-600"
        @click="emit('delete')"
      >
        <Icon icon="lucide:trash-2" class="mr-1.5 h-4 w-4" />
        Delete
      </Button>
      <div class="mx-1 h-6 w-px bg-gray-200" />
      <Button variant="ghost" size="icon" class="h-8 w-8" @click="emit('close')">
        <Icon icon="lucide:x" class="h-4 w-4" />
      </Button>
    </div>
  </div>

  <!-- Add Mode Header -->
  <div
    v-else
    class="flex items-center justify-between border-b bg-gray-50 px-6 py-4"
  >
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Icon icon="lucide:plus" class="h-5 w-5 text-primary" />
      </div>
      <div>
        <SheetTitle class="text-base font-semibold text-gray-900">
          Add New Question
        </SheetTitle>
        <VisuallyHidden>
          <SheetDescription>
            Create a new question for your testimonial form
          </SheetDescription>
        </VisuallyHidden>
        <p class="text-xs text-gray-500">
          Create a custom question for your form
        </p>
      </div>
    </div>

    <!-- Add Mode Actions -->
    <div class="flex items-center gap-2">
      <Button variant="outline" size="sm" @click="emit('close')">
        Cancel
      </Button>
      <Button size="sm" :disabled="!isValid" @click="emit('add')">
        <Icon icon="lucide:plus" class="mr-1.5 h-4 w-4" />
        Add Question
      </Button>
    </div>
  </div>
</template>
