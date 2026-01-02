import { ref, computed, watch, type ComputedRef } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import type { SectionId } from '../models';

interface SectionUrlParams {
  section?: string;
}

/**
 * URL-synchronized form section state composable
 *
 * Manages expansion state for the 3 collapsible sections on the form builder page.
 * Syncs with URL query parameter for shareable/bookmarkable states.
 *
 * @example
 * ```typescript
 * const sections = useFormSections({
 *   canExpandQuestions: computed(() => canProceedFromProductInfo.value),
 *   canExpandPreview: computed(() => questions.value.length > 0),
 * });
 *
 * // Check if a section is expanded
 * sections.productInfoExpanded.value
 *
 * // Toggle a section
 * sections.toggleSection('questions');
 * ```
 */
export function useFormSections(options: {
  canExpandQuestions: ComputedRef<boolean>;
  canExpandPreview: ComputedRef<boolean>;
}) {
  const { canExpandQuestions, canExpandPreview } = options;

  // URL params for section state
  const params = useUrlSearchParams<SectionUrlParams>('history', {
    initialValue: { section: undefined },
    removeNullishValues: true,
  });

  // Section expansion states
  const productInfoExpanded = ref(true);
  const questionsExpanded = ref(false);
  const previewExpanded = ref(false);

  // Computed disabled states
  const questionsDisabled = computed(() => !canExpandQuestions.value);
  const previewDisabled = computed(() => !canExpandPreview.value);

  /**
   * Toggle a section's expansion state
   */
  function toggleSection(sectionId: SectionId) {
    switch (sectionId) {
      case 'product-info':
        productInfoExpanded.value = !productInfoExpanded.value;
        break;
      case 'questions':
        if (!questionsDisabled.value) {
          questionsExpanded.value = !questionsExpanded.value;
        }
        break;
      case 'preview':
        if (!previewDisabled.value) {
          previewExpanded.value = !previewExpanded.value;
        }
        break;
    }
    updateUrlParam();
  }

  /**
   * Expand a specific section (and optionally collapse others)
   */
  function expandSection(sectionId: SectionId, collapseOthers = false) {
    if (collapseOthers) {
      productInfoExpanded.value = false;
      questionsExpanded.value = false;
      previewExpanded.value = false;
    }

    switch (sectionId) {
      case 'product-info':
        productInfoExpanded.value = true;
        break;
      case 'questions':
        if (!questionsDisabled.value) {
          questionsExpanded.value = true;
        }
        break;
      case 'preview':
        if (!previewDisabled.value) {
          previewExpanded.value = true;
        }
        break;
    }
    updateUrlParam();
  }

  /**
   * Collapse a specific section
   */
  function collapseSection(sectionId: SectionId) {
    switch (sectionId) {
      case 'product-info':
        productInfoExpanded.value = false;
        break;
      case 'questions':
        questionsExpanded.value = false;
        break;
      case 'preview':
        previewExpanded.value = false;
        break;
    }
    updateUrlParam();
  }

  /**
   * Update URL param to reflect current primary expanded section
   */
  function updateUrlParam() {
    // Set URL to the most "important" expanded section
    if (previewExpanded.value) {
      params.section = 'preview';
    } else if (questionsExpanded.value) {
      params.section = 'questions';
    } else if (productInfoExpanded.value) {
      params.section = 'product-info';
    } else {
      params.section = undefined;
    }
  }

  /**
   * Initialize sections based on form state
   * Called after form data is loaded
   */
  function initializeSections(hasQuestions: boolean, questionsInDb: boolean) {
    // Check if URL has a section param
    if (params.section) {
      const sectionFromUrl = params.section as SectionId;
      expandSection(sectionFromUrl, true);
      return;
    }

    // Auto-expand based on form state
    if (!hasQuestions) {
      // No questions yet - start at product info
      productInfoExpanded.value = true;
      questionsExpanded.value = false;
      previewExpanded.value = false;
    } else if (!questionsInDb) {
      // Questions generated but not saved - show questions
      productInfoExpanded.value = false;
      questionsExpanded.value = true;
      previewExpanded.value = false;
    } else {
      // Form has saved questions - show preview
      productInfoExpanded.value = false;
      questionsExpanded.value = false;
      previewExpanded.value = true;
    }
    updateUrlParam();
  }

  /**
   * Handle when question generation starts
   * Closes Product Info and opens Questions section immediately
   * so user can see the AI loader animation
   */
  function onGenerationStarted() {
    productInfoExpanded.value = false;
    questionsExpanded.value = true;
    previewExpanded.value = false;
    updateUrlParam();
  }

  /**
   * Handle after questions are generated
   */
  function onQuestionsGenerated() {
    productInfoExpanded.value = false;
    questionsExpanded.value = true;
    previewExpanded.value = false;
    updateUrlParam();
  }

  /**
   * Handle after questions are saved
   */
  function onQuestionsSaved() {
    previewExpanded.value = true;
    updateUrlParam();
  }

  // Watch for URL changes (browser back/forward)
  watch(
    () => params.section,
    (newSection) => {
      if (newSection) {
        expandSection(newSection as SectionId, true);
      }
    }
  );

  return {
    // Expansion states
    productInfoExpanded,
    questionsExpanded,
    previewExpanded,

    // Disabled states
    questionsDisabled,
    previewDisabled,

    // Actions
    toggleSection,
    expandSection,
    collapseSection,
    initializeSections,
    onGenerationStarted,
    onQuestionsGenerated,
    onQuestionsSaved,
  };
}
