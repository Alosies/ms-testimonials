import { ref, computed, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import {
  parseDesignConfig,
  serializeDesignConfig,
  DEFAULT_DESIGN_CONFIG,
  DEFAULT_PRIMARY_COLOR_HEX,
  type FormDesignConfig,
} from '@/entities/form';
import { useUpdateFormAutoSave } from '@/entities/form';

interface UseTimelineDesignConfigOptions {
  formId: Ref<string | null>;
}

/**
 * Timeline Design Config - Manages form design customization
 *
 * Composed into useTimelineEditor for centralized state management.
 * Handles:
 * - Primary color customization
 * - Logo URL (with org fallback)
 * - Auto-save with debounce
 */
export function useTimelineDesignConfig(options: UseTimelineDesignConfigOptions) {
  const { formId } = options;

  // State
  const designConfig = ref<FormDesignConfig>({ ...DEFAULT_DESIGN_CONFIG });
  const orgLogoUrl = ref<string | null>(null);
  const isSaving = ref(false);
  const saveError = ref<string | null>(null);

  // Mutation for saving
  const { updateFormAutoSave } = useUpdateFormAutoSave();

  // Computed values
  const primaryColor = computed(() => designConfig.value.primaryColor);

  const effectivePrimaryColor = computed(
    () => designConfig.value.primaryColor ?? DEFAULT_PRIMARY_COLOR_HEX
  );

  const logoUrl = computed(() => designConfig.value.logoUrl);

  const effectiveLogo = computed(
    () => designConfig.value.logoUrl ?? orgLogoUrl.value
  );

  const isUsingOrgLogo = computed(
    () => !designConfig.value.logoUrl && !!orgLogoUrl.value
  );

  const hasCustomColor = computed(() => !!designConfig.value.primaryColor);

  const hasCustomLogo = computed(() => !!designConfig.value.logoUrl);

  // Save function
  async function saveSettings() {
    if (!formId.value) return;

    isSaving.value = true;
    saveError.value = null;

    try {
      await updateFormAutoSave({
        id: formId.value,
        changes: {
          settings: serializeDesignConfig(designConfig.value),
        },
      });
    } catch (error) {
      saveError.value =
        error instanceof Error ? error.message : 'Failed to save design settings';
    } finally {
      isSaving.value = false;
    }
  }

  // Debounced save (500ms)
  const debouncedSave = useDebounceFn(saveSettings, 500);

  // Initialize from form data
  function setDesignConfig(settings: unknown, orgLogo: string | null) {
    designConfig.value = parseDesignConfig(settings);
    orgLogoUrl.value = orgLogo;
  }

  // Update functions
  function updatePrimaryColor(color: string | null) {
    designConfig.value = {
      ...designConfig.value,
      primaryColor: color,
    };
    debouncedSave();
  }

  function updateLogoUrl(url: string | null) {
    designConfig.value = {
      ...designConfig.value,
      logoUrl: url,
    };
    debouncedSave();
  }

  function resetPrimaryColor() {
    updatePrimaryColor(null);
  }

  function resetLogoUrl() {
    updateLogoUrl(null);
  }

  // Reset all state
  function resetDesignConfig() {
    designConfig.value = { ...DEFAULT_DESIGN_CONFIG };
    orgLogoUrl.value = null;
    saveError.value = null;
  }

  return {
    // State (readonly where appropriate)
    designConfig,
    isSaving,
    saveError,

    // Computed values
    primaryColor,
    effectivePrimaryColor,
    logoUrl,
    effectiveLogo,
    orgLogoUrl,
    isUsingOrgLogo,
    hasCustomColor,
    hasCustomLogo,

    // Actions
    setDesignConfig,
    updatePrimaryColor,
    updateLogoUrl,
    resetPrimaryColor,
    resetLogoUrl,
    resetDesignConfig,
  };
}
