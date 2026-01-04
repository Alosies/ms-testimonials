<script setup lang="ts">
/**
 * Form Creation Wizard
 *
 * Multi-step wizard for creating a new testimonial collection form.
 * Collects product/service/event context, generates AI questions,
 * and creates the form with steps.
 */
import { provide, onUnmounted, ref } from 'vue';
import { useFormWizard, type FormWizardContext } from '../../composables/useFormWizard';
import { useCreateFormWithSteps, type CreateFormWithStepsParams } from '../../composables/useCreateFormWithSteps';
import { useRouting } from '@/shared/routing';
import WizardLayout from './WizardLayout.vue';
import ConceptTypeScreen from './screens/ConceptTypeScreen.vue';
import DescriptionScreen from './screens/DescriptionScreen.vue';
import FocusAreasScreen from './screens/FocusAreasScreen.vue';
import GeneratingScreen from './screens/GeneratingScreen.vue';
import PreviewScreen from './screens/PreviewScreen.vue';

const { goToFormStudio, goToForms } = useRouting();

// Initialize wizard state
const wizard = useFormWizard();
const { createFormWithSteps } = useCreateFormWithSteps();

// Provide wizard context to child components
provide<FormWizardContext>('wizardContext', wizard);

// Local state for form creation
const isCreatingForm = ref(false);

// Handle "Customize in Form Studio" click
async function handleCustomize() {
  if (isCreatingForm.value) return;

  isCreatingForm.value = true;

  try {
    // Type assertion needed because wizard state uses readonly() which makes objects deeply readonly
    const params: CreateFormWithStepsParams = {
      conceptName: wizard.conceptName.value,
      description: wizard.description.value,
      questions: wizard.generatedQuestions.value,
      aiContext: wizard.aiContext.value,
    };
    const result = await createFormWithSteps(params);

    if (result) {
      // Navigate to Form Studio
      goToFormStudio(
        { name: wizard.conceptName.value, id: result.formId },
        { replace: true }
      );
    }
  } finally {
    isCreatingForm.value = false;
  }
}

// Handle escape - navigate back to forms list
function handleEscape() {
  wizard.resetWizard();
  goToForms();
}

// Cleanup on unmount
onUnmounted(() => {
  wizard.resetWizard();
});
</script>

<template>
  <WizardLayout :current-screen="wizard.currentScreen.value" @escape="handleEscape">
    <!-- Screen 1: Concept Type -->
    <ConceptTypeScreen
      v-if="wizard.currentScreen.value === 1"
    />

    <!-- Screen 2: Description -->
    <DescriptionScreen
      v-else-if="wizard.currentScreen.value === 2"
    />

    <!-- Screen 3: Focus Areas -->
    <FocusAreasScreen
      v-else-if="wizard.currentScreen.value === 3"
    />

    <!-- Screen 4: Generating -->
    <GeneratingScreen
      v-else-if="wizard.currentScreen.value === 4"
    />

    <!-- Screen 5: Preview -->
    <PreviewScreen
      v-else-if="wizard.currentScreen.value === 5"
      :is-creating="isCreatingForm"
      @customize="handleCustomize"
    />
  </WizardLayout>
</template>
