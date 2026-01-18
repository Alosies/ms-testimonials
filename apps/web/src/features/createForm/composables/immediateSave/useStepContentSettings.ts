/**
 * Step Content Settings - Immediate save for discrete step content changes
 *
 * Wraps useUpdateFormStepAutoSave with save lock for:
 * - Consent required toggle
 *
 * Uses withSaveIndicator to show the Saving → Saved chip transition.
 * Clears the step's dirty flag after save to prevent auto-save from re-saving.
 *
 * IMPORTANT: Step content is stored as JSONB. Zod schemas provide runtime
 * validation on both read (stepTransform) and write (validateStepContent).
 *
 * @see ADR-011: Immediate Save Actions
 */
import { useUpdateFormStepAutoSave, validateStepContent } from '@/entities/formStep';
import { useSaveLock, useAutoSaveController, useDirtyTracker } from '../autoSave';
import type { ConsentContent, StepContent, StepType } from '@/shared/stepCards';

/**
 * Validate and cast strictly-typed step content for GraphQL mutations.
 * Runtime validates with Zod before passing to GraphQL.
 *
 * @param stepType - The step type for schema selection
 * @param content - Strictly typed step content (ConsentContent, WelcomeContent, etc.)
 * @returns GraphQL-compatible JSON object
 * @throws ZodError if content doesn't match expected schema
 */
function toJsonbContent<T extends StepContent>(
  stepType: StepType,
  content: T
): Record<string, unknown> {
  // Runtime validation ensures content matches schema before save
  validateStepContent(stepType, content);
  return content as unknown as Record<string, unknown>;
}

export function useStepContentSettings() {
  const { updateFormStepAutoSave } = useUpdateFormStepAutoSave();
  const { withLock } = useSaveLock();
  const { withSaveIndicator } = useAutoSaveController();
  const { clearStep } = useDirtyTracker();

  /**
   * Set the required field for a consent step with immediate persistence.
   * Clears the step's dirty flag after save to prevent auto-save from re-saving.
   */
  const setConsentRequired = async (
    stepId: string,
    currentContent: ConsentContent,
    isRequired: boolean
  ) => {
    return withSaveIndicator(() =>
      withLock('consent-required', async () => {
        // Strictly typed - TypeScript + Zod validates all fields
        const updatedContent: ConsentContent = {
          ...currentContent,
          required: isRequired,
        };
        await updateFormStepAutoSave({
          id: stepId,
          changes: {
            // Zod validates before save
            content: toJsonbContent('consent', updatedContent),
          },
        });
        // Clear dirty flag to prevent auto-save from re-saving
        clearStep(stepId);
      })
    );
  };

  return {
    setConsentRequired,
  };
}
