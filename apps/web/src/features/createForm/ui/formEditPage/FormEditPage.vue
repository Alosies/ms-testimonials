<script setup lang="ts">
/**
 * Form Edit Page Feature Component
 *
 * Main feature component for the timeline-based form editor.
 * Handles all editor logic, keyboard navigation, and scroll detection.
 */
import { ref, watch } from 'vue';
import { Kbd } from '@testimonials/ui';
import FormEditorLayout from '@/layouts/FormEditorLayout.vue';
import FormEditorHeader from '../FormEditorHeader.vue';
import { PropertiesPanel } from '../propertiesPanel';
import StepEditorSlideIn from '../stepEditor/StepEditorSlideIn.vue';
import {
  useTimelineEditor,
  useKeyboardNavigation,
  useScrollStepDetection,
} from '../../composables/timeline';
import TimelineSidebar from './TimelineSidebar.vue';
import TimelineCanvas from './TimelineCanvas.vue';

const props = defineProps<{
  formId: string;
}>();

const emit = defineEmits<{
  back: [];
  preview: [];
  publish: [];
}>();

// Initialize editor composables
const editor = useTimelineEditor();
useKeyboardNavigation();
useScrollStepDetection();

// Initialize editor with formId (resets state if formId changes)
watch(() => props.formId, (id) => editor.setFormId(id), { immediate: true });

// Header state
const formName = ref('My Test Form');
const saveStatus = ref<'saved' | 'saving' | 'unsaved' | 'error'>('saved');

// Header handlers
function handleFormNameUpdate(name: string) {
  formName.value = name;
  saveStatus.value = 'unsaved';
}
</script>

<template>
  <FormEditorLayout>
    <template #header>
      <FormEditorHeader
        :form-name="formName"
        :save-status="saveStatus"
        :can-publish="true"
        @back="emit('back')"
        @preview="emit('preview')"
        @publish="emit('publish')"
        @update:form-name="handleFormNameUpdate"
      />
    </template>

    <template #sidebar>
      <TimelineSidebar />
    </template>

    <template #canvas-overlay>
      <div
        v-if="editor.steps.value.length > 1"
        class="absolute top-4 right-4 hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border/50 text-muted-foreground text-sm shadow-sm pointer-events-auto"
      >
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
        <span class="ml-1 text-xs">to navigate</span>
      </div>
    </template>

    <template #timeline>
      <TimelineCanvas />
    </template>

    <template #properties>
      <PropertiesPanel />
    </template>
  </FormEditorLayout>

  <StepEditorSlideIn />
</template>
