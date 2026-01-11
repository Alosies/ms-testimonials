import { watch } from 'vue';
import { useDirtyTracker } from './useDirtyTracker';
import { useTimelineEditor } from '../timeline/useTimelineEditor';

/**
 * Form Info Watcher
 *
 * Watches form-level text fields: name, product_name, product_description
 *
 * Note: Form info is currently not in a singleton composable.
 * This watcher needs to be initialized with access to the form data.
 * For now, FormStudioPage should call this after setting up form state.
 *
 * TODO: Once shared form state composable is created, import and use it here.
 */
export const useFormInfoWatcher = () => {
  const { mark } = useDirtyTracker();
  const editor = useTimelineEditor();

  // Watch formContext for product name/description changes
  // Note: formContext is set by useFormStudioData when form loads
  // This is a read-only context, so we track when it might be edited
  watch(
    () => editor.formContext.value,
    (curr, prev) => {
      if (!curr || !prev) return;
      // Only mark dirty if actual content changed (not just initial load)
      if (
        curr.productName !== prev.productName ||
        curr.productDescription !== prev.productDescription
      ) {
        mark.formInfo();
      }
    },
    { deep: true }
  );
};

/**
 * Question Text Watcher
 *
 * Watches text fields on the active question:
 * - questionText, placeholder, helpText, scaleMinLabel, scaleMaxLabel
 *
 * IMPORTANT: Uses curr.id === prev.id check to avoid marking dirty
 * when the user switches between questions. The "change" from Q1 to Q2
 * is a selection change, not a text edit.
 */
export const useQuestionTextWatcher = () => {
  const { mark } = useDirtyTracker();
  const editor = useTimelineEditor();

  watch(
    () => {
      const step = editor.selectedStep.value;
      const question = step?.question;
      if (!question) return null;
      return {
        id: question.id,
        fields: [
          question.questionText,
          question.placeholder,
          question.helpText,
          question.scaleMinLabel,
          question.scaleMaxLabel,
        ],
      };
    },
    (curr, prev) => {
      // IMPORTANT: Only mark dirty when SAME question changed (curr.id === prev.id)
      // When user switches steps (different question IDs), the "change" is just selection,
      // not a text edit. Without this check, switching steps would incorrectly
      // mark the new question as dirty with no actual text changes.
      if (curr && prev && curr.id === prev.id) {
        mark.question(curr.id);
      }
    },
    { deep: true }
  );
};

/**
 * Option Text Watcher
 *
 * Watches text fields on question options: optionLabel, optionValue
 *
 * Uses ID-based comparison since multiple options can exist per question.
 * Compares old vs new option values using an ID map.
 */
export const useOptionTextWatcher = () => {
  const { mark } = useDirtyTracker();
  const editor = useTimelineEditor();

  watch(
    () => {
      const options = editor.selectedStep.value?.question?.options;
      if (!options) return null;
      return options.map((o) => ({
        id: o.id,
        label: o.optionLabel,
        value: o.optionValue,
      }));
    },
    (curr, prev) => {
      if (!curr || !prev) return;

      // Build map of previous option values by ID
      const prevMap = new Map(prev.map((o) => [o.id, o]));

      // Compare each current option to its previous state
      for (const opt of curr) {
        const old = prevMap.get(opt.id);
        // Only mark dirty if option existed before and text changed
        if (old && (opt.label !== old.label || opt.value !== old.value)) {
          mark.option(opt.id);
        }
      }
    },
    { deep: true }
  );
};

/**
 * Step Tips Watcher
 *
 * Watches the tips array on the active step.
 *
 * IMPORTANT: Uses curr.id === prev.id check to avoid marking dirty
 * when the user switches between steps.
 */
export const useStepTipsWatcher = () => {
  const { mark } = useDirtyTracker();
  const editor = useTimelineEditor();

  watch(
    () => {
      const step = editor.selectedStep.value;
      if (!step) return null;
      return {
        id: step.id,
        tips: step.tips,
      };
    },
    (curr, prev) => {
      // Same entity check: ignore selection changes between steps
      if (curr && prev && curr.id === prev.id) {
        mark.step(curr.id);
      }
    },
    { deep: true }
  );
};

/**
 * Flow Name Watcher
 *
 * Watches flow name field for changes.
 *
 * Note: In the current Form Studio UI, flow names are not directly editable.
 * Flows are managed through branching configuration, not text fields.
 * This watcher is included for completeness and future extensibility.
 *
 * TODO: If flow name editing is added to the UI, implement proper watching here.
 */
export const useFlowNameWatcher = () => {
  // const { mark } = useDirtyTracker();
  // const editor = useTimelineEditor();

  // Flow names are not currently editable in the Form Studio UI.
  // The branchingConfig contains flow-related settings but not editable names.
  // When flow name editing is added, this watcher should:
  // 1. Watch the active flow's name field
  // 2. Use curr.id === prev.id check to avoid marking dirty on flow switch
  // 3. Call mark.flow(flowId) when name changes
};
