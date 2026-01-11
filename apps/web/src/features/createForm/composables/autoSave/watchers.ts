import { ref, watch } from 'vue';
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

  // Track previous values using refs
  const prevProductName = ref<string | undefined>(undefined);
  const prevProductDescription = ref<string | undefined>(undefined);

  // Watch formContext for product name/description changes
  // Note: formContext is set by useFormStudioData when form loads
  watch(
    () => ({
      productName: editor.formContext.value.productName,
      productDescription: editor.formContext.value.productDescription,
    }),
    (curr) => {
      // Skip initial load when prev values are undefined
      if (prevProductName.value === undefined && prevProductDescription.value === undefined) {
        prevProductName.value = curr.productName;
        prevProductDescription.value = curr.productDescription;
        return;
      }

      // Only mark dirty if actual content changed
      if (
        curr.productName !== prevProductName.value ||
        curr.productDescription !== prevProductDescription.value
      ) {
        mark.formInfo();
        prevProductName.value = curr.productName;
        prevProductDescription.value = curr.productDescription;
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
      //
      // CRITICAL: Must also compare actual field values, not just IDs!
      // With { deep: true }, the watcher fires on ANY change to the step object.
      // Without this comparison, unrelated changes (like isModified flag) would
      // incorrectly mark the question dirty, causing infinite save loops.
      if (curr && prev && curr.id === prev.id) {
        const fieldsChanged = JSON.stringify(curr.fields) !== JSON.stringify(prev.fields);
        if (fieldsChanged) {
          mark.question(curr.id);
        }
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
      //
      // CRITICAL: Must also compare actual tips values, not just IDs!
      // With { deep: true }, the watcher fires on ANY change to the step object.
      // Without this comparison, unrelated changes (like isModified flag after save)
      // would incorrectly mark the step dirty, causing infinite save loops.
      if (curr && prev && curr.id === prev.id) {
        const tipsChanged = JSON.stringify(curr.tips) !== JSON.stringify(prev.tips);
        if (tipsChanged) {
          mark.step(curr.id);
        }
      }
    },
    { deep: true }
  );
};

/**
 * Step Content Watcher
 *
 * Watches content object for all non-question step types:
 * - welcome: title, subtitle, buttonText
 * - thank_you: title, message, socialShareMessage, redirectUrl
 * - consent: title, description, options.public/private labels/descriptions
 * - contact_info: title, subtitle
 * - reward: title, description, couponCode, couponDescription, downloadUrl, etc.
 *
 * Question and Rating steps use the question watcher instead (they have no content).
 *
 * Tracks previous values using refs to handle step selection changes properly.
 * When the user switches to a new content step, we store its initial hash
 * and only mark dirty on subsequent edits.
 */
export const useStepContentWatcher = () => {
  const { mark } = useDirtyTracker();
  const editor = useTimelineEditor();

  // Track previous step ID and content hash using refs
  const prevStepId = ref<string | null>(null);
  const prevContentHash = ref<string | null>(null);

  const stepTypesWithContent = ['welcome', 'thank_you', 'consent', 'contact_info', 'reward'];

  watch(
    () => {
      const step = editor.selectedStep.value;
      if (!step) return null;

      // Question and Rating steps don't have content - they use form_questions
      if (!stepTypesWithContent.includes(step.stepType)) return null;

      // Watch the entire content object (all text fields within)
      const content = step.content as Record<string, unknown> | undefined;
      if (!content) return null;

      return {
        id: step.id,
        contentHash: JSON.stringify(content),
      };
    },
    (curr) => {
      // No content step selected
      if (!curr) {
        prevStepId.value = null;
        prevContentHash.value = null;
        return;
      }

      // Step changed - store new baseline and don't mark dirty
      if (curr.id !== prevStepId.value) {
        prevStepId.value = curr.id;
        prevContentHash.value = curr.contentHash;
        return;
      }

      // Same step - check if content actually changed
      if (curr.contentHash !== prevContentHash.value) {
        mark.step(curr.id);
        prevContentHash.value = curr.contentHash;
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
