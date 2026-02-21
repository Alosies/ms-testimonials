import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import {
  useUpdateForm,
  parseDesignConfig,
  serializeDesignConfig,
  DEFAULT_PRIMARY_COLOR_HEX,
  type FormDesignConfig,
} from '@/entities/form';
import type { FormBasicFragment } from '@/shared/graphql/generated/operations';

export type FormStatus = 'draft' | 'published' | 'archived';

export interface UseFormSettingsOptions {
  form: Ref<FormBasicFragment | null>;
}

export interface UseFormSettingsReturn {
  // General settings
  name: Ref<string>;
  productName: Ref<string>;
  productDescription: Ref<string>;

  // Status
  status: Ref<FormStatus>;
  isPublished: ComputedRef<boolean>;

  // Design
  primaryColor: Ref<string>;
  hasCustomColor: ComputedRef<boolean>;
  resetColor: () => void;

  // AI
  aiGenerationLimit: Ref<number | null>;

  // State
  hasChanges: ComputedRef<boolean>;
  isSaving: Ref<boolean>;
  saveError: Ref<string | null>;

  // Actions
  save: () => Promise<boolean>;
}

/**
 * Composable for managing form settings state, change detection, and save operations.
 *
 * @param options - Options containing the form ref from useGetForm
 * @returns Settings state and actions
 */
export function useFormSettings(options: UseFormSettingsOptions): UseFormSettingsReturn {
  const { form } = options;
  const { updateForm, loading: isSaving } = useUpdateForm();

  // ============================================
  // Local State
  // ============================================

  // General settings
  const name = ref('');
  const productName = ref('');
  const productDescription = ref('');

  // Status
  const status = ref<FormStatus>('draft');

  // Design
  const primaryColor = ref(DEFAULT_PRIMARY_COLOR_HEX);

  // AI
  const aiGenerationLimit = ref<number | null>(null);

  // Error state
  const saveError = ref<string | null>(null);

  // ============================================
  // Initialize from form data
  // ============================================

  function initializeFromForm(formData: FormBasicFragment) {
    name.value = formData.name;
    productName.value = formData.product_name ?? '';
    productDescription.value = formData.product_description ?? '';
    status.value = (formData.status as FormStatus) || 'draft';

    const designConfig = parseDesignConfig(formData.settings);
    primaryColor.value = designConfig.primaryColor ?? DEFAULT_PRIMARY_COLOR_HEX;
    aiGenerationLimit.value = designConfig.aiGenerationLimit;
  }

  // Watch for form data changes (e.g., refetch)
  watch(
    () => form.value,
    (newForm) => {
      if (newForm) {
        initializeFromForm(newForm);
      }
    },
    { immediate: true },
  );

  // ============================================
  // Computed Properties
  // ============================================

  const isPublished = computed(() => status.value === 'published');

  const hasCustomColor = computed(
    () => primaryColor.value !== DEFAULT_PRIMARY_COLOR_HEX,
  );

  const hasChanges = computed(() => {
    if (!form.value) return false;

    const currentDesignConfig = parseDesignConfig(form.value.settings);

    const nameChanged = name.value !== form.value.name;
    const productNameChanged = productName.value !== (form.value.product_name ?? '');
    const productDescriptionChanged =
      productDescription.value !== (form.value.product_description ?? '');
    const statusChanged = status.value !== form.value.status;
    const colorChanged =
      primaryColor.value !== (currentDesignConfig.primaryColor ?? DEFAULT_PRIMARY_COLOR_HEX);
    const aiLimitChanged =
      aiGenerationLimit.value !== currentDesignConfig.aiGenerationLimit;

    return (
      nameChanged ||
      productNameChanged ||
      productDescriptionChanged ||
      statusChanged ||
      colorChanged ||
      aiLimitChanged
    );
  });

  // ============================================
  // Actions
  // ============================================

  function resetColor() {
    primaryColor.value = DEFAULT_PRIMARY_COLOR_HEX;
  }

  async function save(): Promise<boolean> {
    if (!form.value) return false;

    saveError.value = null;

    try {
      const currentDesignConfig = parseDesignConfig(form.value.settings);
      const newDesignConfig: FormDesignConfig = {
        ...currentDesignConfig,
        primaryColor:
          primaryColor.value === DEFAULT_PRIMARY_COLOR_HEX ? null : primaryColor.value,
        aiGenerationLimit: aiGenerationLimit.value,
      };

      const result = await updateForm({
        id: form.value.id,
        changes: {
          name: name.value.trim(),
          product_name: productName.value.trim() || null,
          product_description: productDescription.value.trim() || null,
          status: status.value,
          settings: serializeDesignConfig(newDesignConfig),
        },
      });

      return result !== null;
    } catch (error) {
      saveError.value =
        error instanceof Error ? error.message : 'Failed to save settings';
      console.error('Failed to save form settings:', error);
      return false;
    }
  }

  return {
    // General settings
    name,
    productName,
    productDescription,

    // Status
    status,
    isPublished,

    // Design
    primaryColor,
    hasCustomColor,
    resetColor,

    // AI
    aiGenerationLimit,

    // State
    hasChanges,
    isSaving,
    saveError,

    // Actions
    save,
  };
}
