/**
 * useFormStudioData Composable
 *
 * Handles all data loading for the Form Studio:
 * - Form data fetching and context setup
 * - Design config and branching config loading
 * - Steps fetching and transformation
 * - Canvas state management (error, loading, ready)
 * - Retry functionality
 *
 * Extracted from FormStudioPage.vue to keep the component under 250 lines.
 */
import { ref, computed, watch, type Ref, type DeepReadonly } from 'vue';
import { useGetForm, parseBranchingConfig, type BranchingConfig } from '@/entities/form';
import { useGetFormSteps } from '@/entities/formStep';
import { transformFormSteps } from '../../functions';
import type { FormStep, FlowIds } from '@/shared/stepCards';

export interface UseFormStudioDataOptions {
  formId: Ref<string>;
  editor: {
    steps: DeepReadonly<Ref<FormStep[]>>;
    setFormId: (id: string) => void;
    setFormContext: (ctx: { productName?: string; productDescription?: string; flowIds?: FlowIds }) => void;
    setDesignConfig: (settings: unknown, orgLogoPath: string | null) => void;
    setBranchingConfig: (config: BranchingConfig) => void;
    setSteps: (steps: FormStep[]) => void;
  };
}

export function useFormStudioData(options: UseFormStudioDataOptions) {
  const { formId, editor } = options;

  // Track if design config has been loaded for current form
  const designConfigLoaded = ref(false);

  // Track if initial data load has completed (even if empty)
  const hasInitialDataLoaded = ref(false);

  // Form name from loaded data
  const formName = ref('Loading...');

  // Initialize editor with formId (resets state if formId changes)
  watch(formId, (id) => {
    editor.setFormId(id);
    designConfigLoaded.value = false;
    hasInitialDataLoaded.value = false;
  }, { immediate: true });

  // Fetch form data for context
  const formQueryVars = computed(() => ({ formId: formId.value }));
  const { form } = useGetForm(formQueryVars);

  // Update form context when form data loads
  watch(form, (loadedForm) => {
    if (loadedForm) {
      // Extract flow IDs from the form's flows
      // flow_type: 'shared' at display_order 0 is the default shared flow
      // flow_type: 'branch' flows are testimonial/improvement based on branch_operator
      const flowIds: FlowIds = {};
      if (loadedForm.flows) {
        for (const flow of loadedForm.flows) {
          if (flow.flow_type === 'shared' && flow.display_order === 0) {
            flowIds.shared = flow.id;
          }
          // Branch flows will be handled when branching is enabled
        }
      }

      editor.setFormContext({
        productName: loadedForm.product_name ?? undefined,
        productDescription: loadedForm.product_description ?? undefined,
        flowIds,
      });
      formName.value = loadedForm.name;

      // Load design config only once per form
      if (!designConfigLoaded.value) {
        editor.setDesignConfig(
          loadedForm.settings,
          loadedForm.organization?.logo?.storage_path ?? null
        );
        designConfigLoaded.value = true;
      }

      // Load branching config from database
      if (loadedForm.branching_config) {
        const branchingConfig = parseBranchingConfig(loadedForm.branching_config);
        editor.setBranchingConfig(branchingConfig);
      }
    }
  }, { immediate: true });

  // Fetch form steps
  const stepsQueryVars = computed(() => ({ formId: formId.value }));
  const { formSteps, error: stepsError, refetch: refetchSteps } = useGetFormSteps(stepsQueryVars);

  // Manual retry state tracking
  const isRetrying = ref(false);
  const retryError = ref<Error | null>(null);

  // Canvas state computations
  const hasError = computed(() => stepsError.value || retryError.value);

  const showCanvasError = computed(() => {
    return hasError.value && editor.steps.value.length === 0 && !isRetrying.value;
  });

  const showCanvasLoading = computed(() => {
    if (isRetrying.value) return true;
    // Show loading only if data hasn't loaded yet AND no error
    return !hasInitialDataLoaded.value && !hasError.value;
  });

  const showTimeline = computed(() => {
    // Show timeline once data has loaded (even if empty - will show empty state)
    return hasInitialDataLoaded.value && !hasError.value;
  });

  // Transform and load steps into editor when data arrives
  watch(formSteps, (steps) => {
    // Mark data as loaded once we get a response (even if empty array)
    if (steps !== undefined) {
      hasInitialDataLoaded.value = true;

      if (steps.length > 0) {
        const transformed = transformFormSteps(steps);
        editor.setSteps(transformed);
      } else {
        // Empty form - clear steps to show empty state
        editor.setSteps([]);
      }
    }
  }, { immediate: true });

  /**
   * Handle retry when steps query fails
   */
  async function handleRetrySteps() {
    isRetrying.value = true;
    retryError.value = null;

    try {
      const result = await refetchSteps();
      if (result?.error) {
        retryError.value = result.error;
      } else if (result?.errors?.length) {
        retryError.value = new Error(result.errors[0]?.message ?? 'Query failed');
      }
    } catch (err) {
      retryError.value = err instanceof Error ? err : new Error('Failed to load steps');
    } finally {
      isRetrying.value = false;
    }
  }

  return {
    // Form data
    formName,

    // Canvas state
    showCanvasError,
    showCanvasLoading,
    showTimeline,

    // Retry
    handleRetrySteps,
  };
}
