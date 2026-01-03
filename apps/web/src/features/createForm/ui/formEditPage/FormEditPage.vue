<script setup lang="ts">
/**
 * Form Edit Page Feature Component
 *
 * Main feature component for the timeline-based form editor.
 * Handles all editor logic, keyboard navigation, and scroll detection.
 */
import { ref, watch, computed } from 'vue';
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
import { useGetForm } from '@/entities/form';
import { useGetFormSteps } from '@/entities/formStep';
import type { FormStep, StepType, StepContent } from '../../models/stepContent';
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

// Fetch form data for context
const formQueryVars = computed(() => ({ formId: props.formId }));
const { form } = useGetForm(formQueryVars);

// Update form context when form data loads (for dynamic step defaults)
watch(form, (loadedForm) => {
  if (loadedForm) {
    editor.setFormContext({
      productName: loadedForm.product_name ?? undefined,
      productDescription: loadedForm.product_description ?? undefined,
    });
    // Update form name from database
    formName.value = loadedForm.name;
  }
}, { immediate: true });

// Fetch form steps
const stepsQueryVars = computed(() => ({ formId: props.formId }));
const { formSteps } = useGetFormSteps(stepsQueryVars);

// Transform and load steps into editor when data arrives
watch(formSteps, (steps) => {
  if (steps && steps.length > 0) {
    const transformed: FormStep[] = steps.map((step) => ({
      id: step.id,
      formId: step.form_id,
      stepType: step.step_type as StepType,
      stepOrder: step.step_order,
      questionId: step.question_id ?? null,
      content: (step.content as StepContent) ?? {},
      tips: (step.tips as string[]) ?? [],
      isActive: step.is_active,
      isNew: false,
      isModified: false,
    }));
    editor.setSteps(transformed);
  }
}, { immediate: true });

// Header state
const formName = ref('Loading...');
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
