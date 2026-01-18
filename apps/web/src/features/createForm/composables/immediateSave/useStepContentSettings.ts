/**
 * Step Content Settings - Immediate save for discrete step content changes
 *
 * Wraps useUpdateFormStepAutoSave with save lock for:
 * - Consent required toggle
 *
 * Uses withSaveIndicator to show the Saving → Saved chip transition.
 * Clears the step's dirty flag after save to prevent auto-save from re-saving.
 *
 * IMPORTANT: Step content is stored as JSONB. TypeScript types are the ONLY
 * client-side validation. All content must be strictly typed before saving.
 *
 * @see ADR-011: Immediate Save Actions
 */
import { useUpdateFormStepAutoSave } from '@/entities/formStep';
import { useSaveLock, useAutoSaveController, useDirtyTracker } from '../autoSave';
import type { ConsentContent, StepContent } from '@/shared/stepCards';

/**
 * Type-safe cast for passing strictly-typed step content to GraphQL mutations.
 * This is the ONLY place where we cast to the loose GraphQL JSON type.
 *
 * @param content - Strictly typed step content (ConsentContent, WelcomeContent, etc.)
 * @returns GraphQL-compatible JSON object
 */
function toJsonbContent<T extends StepContent>(content: T): Record<string, unknown> {
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
        // Strictly typed - TypeScript validates all fields
        const updatedContent: ConsentContent = {
          ...currentContent,
          required: isRequired,
        };
        await updateFormStepAutoSave({
          id: stepId,
          changes: {
            content: toJsonbContent(updatedContent),
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
