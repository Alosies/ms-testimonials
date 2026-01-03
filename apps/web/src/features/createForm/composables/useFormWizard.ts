import { ref, computed, readonly } from 'vue';
import { useApiForAI, getErrorMessage } from '@/shared/api';
import type { AIQuestion, AIContext } from '@/shared/api';

// ============================================================================
// Types
// ============================================================================

export type ConceptType = 'product' | 'service' | 'event';
export type WizardScreen = 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  currentScreen: WizardScreen;
  conceptType: ConceptType | null;
  conceptName: string;
  description: string;
  selectedFocusAreas: string[];
  customFocusAreas: string;
  generatedQuestions: AIQuestion[];
  aiContext: AIContext | null;
  isGenerating: boolean;
  generationError: string | null;
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Form Creation Wizard State Management
 *
 * Manages the multi-step wizard flow for creating a new form:
 * 1. Concept Type - Product/Service/Event selection
 * 2. Description - Detailed context for AI
 * 3. Focus Areas - What testimonials should highlight
 * 4. Generating - AI question generation
 * 5. Preview - Review generated flow before creating form
 */
export function useFormWizard() {
  const aiApi = useApiForAI();

  // ============================================================================
  // State
  // ============================================================================

  const currentScreen = ref<WizardScreen>(1);

  // Screen 1: Concept Type
  const conceptType = ref<ConceptType | null>(null);
  const conceptName = ref('');

  // Screen 2: Description
  const description = ref('');

  // Screen 3: Focus Areas
  const selectedFocusAreas = ref<string[]>([]);
  const customFocusAreas = ref('');

  // Screen 4 & 5: Generation
  const generatedQuestions = ref<AIQuestion[]>([]);
  const aiContext = ref<AIContext | null>(null);
  const isGenerating = ref(false);
  const generationError = ref<string | null>(null);

  // ============================================================================
  // Validation
  // ============================================================================

  const canProceedToScreen2 = computed(
    () => conceptType.value !== null && conceptName.value.trim().length >= 2
  );

  const canProceedToScreen3 = computed(
    () => description.value.trim().length >= 20
  );

  // Focus areas are optional, so we can always generate
  const canGenerate = computed(() => true);

  const hasGeneratedQuestions = computed(
    () => generatedQuestions.value.length > 0
  );

  // ============================================================================
  // Navigation
  // ============================================================================

  function goToScreen(screen: WizardScreen) {
    currentScreen.value = screen;
  }

  function goNext() {
    if (currentScreen.value < 5) {
      currentScreen.value = (currentScreen.value + 1) as WizardScreen;
    }
  }

  function goBack() {
    if (currentScreen.value > 1) {
      currentScreen.value = (currentScreen.value - 1) as WizardScreen;
    }
  }

  // ============================================================================
  // Focus Area Helpers
  // ============================================================================

  function toggleFocusArea(area: string) {
    const current = selectedFocusAreas.value;
    if (current.includes(area)) {
      // Remove - use immutable update for proper reactivity
      selectedFocusAreas.value = current.filter(a => a !== area);
    } else {
      // Add - use immutable update for proper reactivity
      selectedFocusAreas.value = [...current, area];
    }
  }

  function isFocusAreaSelected(area: string): boolean {
    return selectedFocusAreas.value.includes(area);
  }

  // ============================================================================
  // AI Generation
  // ============================================================================

  /**
   * Build focus areas string for API
   */
  function buildFocusAreasString(): string {
    const allAreas = [...selectedFocusAreas.value];
    if (customFocusAreas.value.trim()) {
      allAreas.push(customFocusAreas.value.trim());
    }
    return allAreas.join(', ');
  }

  /**
   * Generate questions using AI
   */
  async function generateQuestions(): Promise<boolean> {
    if (isGenerating.value) return false;

    isGenerating.value = true;
    generationError.value = null;
    currentScreen.value = 4;

    try {
      const result = await aiApi.suggestQuestions({
        product_name: conceptName.value,
        product_description: description.value,
        focus_areas: buildFocusAreasString() || undefined,
      });

      generatedQuestions.value = result.questions;
      aiContext.value = result.inferred_context;
      currentScreen.value = 5;

      return true;
    } catch (error) {
      generationError.value = getErrorMessage(error);
      // Stay on screen 4 to show error with retry option
      return false;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Regenerate questions (from preview screen)
   */
  function regenerate() {
    generatedQuestions.value = [];
    aiContext.value = null;
    generateQuestions();
  }

  /**
   * Retry generation after error
   */
  function retryGeneration() {
    generationError.value = null;
    generateQuestions();
  }

  /**
   * Go back from generation error to edit focus areas
   */
  function goBackFromError() {
    generationError.value = null;
    currentScreen.value = 3;
  }

  // ============================================================================
  // Reset
  // ============================================================================

  function resetWizard() {
    currentScreen.value = 1;
    conceptType.value = null;
    conceptName.value = '';
    description.value = '';
    selectedFocusAreas.value = [];
    customFocusAreas.value = '';
    generatedQuestions.value = [];
    aiContext.value = null;
    isGenerating.value = false;
    generationError.value = null;
  }

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State (readonly where appropriate)
    currentScreen: readonly(currentScreen),
    conceptType,
    conceptName,
    description,
    selectedFocusAreas: readonly(selectedFocusAreas),
    customFocusAreas,
    generatedQuestions: readonly(generatedQuestions),
    aiContext: readonly(aiContext),
    isGenerating: readonly(isGenerating),
    generationError: readonly(generationError),

    // Computed
    canProceedToScreen2,
    canProceedToScreen3,
    canGenerate,
    hasGeneratedQuestions,

    // Navigation
    goToScreen,
    goNext,
    goBack,

    // Focus Areas
    toggleFocusArea,
    isFocusAreaSelected,

    // Generation
    generateQuestions,
    regenerate,
    retryGeneration,
    goBackFromError,

    // Reset
    resetWizard,
  };
}

/**
 * Type for the return value of useFormWizard
 */
export type FormWizardContext = ReturnType<typeof useFormWizard>;
