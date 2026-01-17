/**
 * Design Control - Form design configuration operations
 *
 * ADR-014 Phase 3: Interface Segregation Principle (ISP) compliance.
 *
 * Use this in components that need to manage form design customization,
 * such as the DesignPanel or visual customization UI.
 *
 * @example
 * ```ts
 * // In DesignPanel.vue
 * const { designConfig, updatePrimaryColor, updateLogoUrl } = useDesignControl();
 * ```
 */
import type { ComputedRef, Ref } from 'vue';
import { computed } from 'vue';
import { useTimelineEditor } from '../timeline/useTimelineEditor';
import type { FormDesignConfig } from '@/entities/form';

/**
 * Design control interface for visual customization.
 */
export interface DesignControl {
  /** Current design configuration (read-only) */
  designConfig: ComputedRef<FormDesignConfig>;

  /** Current primary color (null if using default) */
  primaryColor: ComputedRef<string | null>;

  /** Effective primary color (custom or org default) */
  effectivePrimaryColor: ComputedRef<string>;

  /** Whether form has custom color */
  hasCustomColor: ComputedRef<boolean>;

  /** Current logo URL (null if using default) */
  logoUrl: ComputedRef<string | null>;

  /** Effective logo URL (custom or org default) */
  effectiveLogo: ComputedRef<string | null>;

  /** Organization's default logo URL */
  orgLogoUrl: ComputedRef<string | null>;

  /** Whether form is using org logo */
  isUsingOrgLogo: ComputedRef<boolean>;

  /** Whether form has custom logo */
  hasCustomLogo: ComputedRef<boolean>;

  /** Whether design changes are being saved */
  isSaving: Ref<boolean>;

  /** Any save error message */
  saveError: Ref<string | null>;

  /** Update primary color */
  updatePrimaryColor: (color: string | null) => void;

  /** Update logo URL */
  updateLogoUrl: (url: string | null) => void;

  /** Reset primary color to default */
  resetPrimaryColor: () => void;

  /** Reset logo URL to org default */
  resetLogoUrl: () => void;

  /** Reset all design config to defaults */
  resetDesignConfig: () => void;

  /** Set entire design configuration from form data */
  setDesignConfig: (settings: unknown, orgLogo: string | null) => void;
}

/**
 * Design configuration operations.
 *
 * Use this in components that need to manage form visual customization.
 */
export function useDesignControl(): DesignControl {
  const editor = useTimelineEditor();

  return {
    // Read-only state
    designConfig: computed(() => editor.designConfig.value),
    primaryColor: computed(() => editor.primaryColor.value),
    effectivePrimaryColor: computed(() => editor.effectivePrimaryColor.value),
    hasCustomColor: computed(() => editor.hasCustomColor.value),
    logoUrl: computed(() => editor.logoUrl.value),
    effectiveLogo: computed(() => editor.effectiveLogo.value),
    orgLogoUrl: computed(() => editor.orgLogoUrl.value),
    isUsingOrgLogo: computed(() => editor.isUsingOrgLogo.value),
    hasCustomLogo: computed(() => editor.hasCustomLogo.value),

    // Save state
    isSaving: editor.designSaving,
    saveError: editor.designSaveError,

    // Operations
    updatePrimaryColor: editor.updatePrimaryColor,
    updateLogoUrl: editor.updateLogoUrl,
    resetPrimaryColor: editor.resetPrimaryColor,
    resetLogoUrl: editor.resetLogoUrl,
    resetDesignConfig: editor.resetDesignConfig,
    setDesignConfig: editor.setDesignConfig,
  };
}
