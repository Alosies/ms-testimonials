/**
 * Form Inputs - Reusable Question Input Components
 *
 * This module provides a set of input components for form questions.
 * Components can be used in both preview mode (disabled) and live form mode.
 *
 * @example
 * ```vue
 * <QuestionInput
 *   v-model="answer"
 *   :question-type-id="question.question_type_id"
 *   :question-id="question.id"
 *   :disabled="isPreview"
 * />
 *
 * <QuestionField
 *   v-model="answer"
 *   :question-text="question.question_text"
 *   :question-type-id="question.question_type_id"
 *   :question-id="question.id"
 * />
 * ```
 */

// Main components
export { default as QuestionInput } from './QuestionInput.vue';
export { default as QuestionField } from './QuestionField.vue';

// Individual input components (for advanced usage)
export * from './components';

// Types
export type * from './models';
