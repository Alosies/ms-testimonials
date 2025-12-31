import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { OrganizationRole, UserDefaultOrganization } from '../models';
import { isAdminRole, isOwnerRole } from '../models';

/**
 * Organization Store
 *
 * Manages the current organization context and user's role within it.
 * Synced with CurrentContextStore for global access.
 */
export const useOrganizationStore = defineStore('organization', () => {
  // ========================================
  // State
  // ========================================
  const currentOrganization = ref<UserDefaultOrganization | null>(null);
  const currentRole = ref<OrganizationRole | null>(null);
  const isLoading = ref(false);

  // ========================================
  // Computed - Organization Properties
  // ========================================
  const organizationId = computed(() => currentOrganization.value?.id ?? null);
  const organizationSlug = computed(() => currentOrganization.value?.slug ?? null);
  const organizationName = computed(() => currentOrganization.value?.name ?? null);
  const setupStatus = computed(() => currentOrganization.value?.setup_status ?? null);
  const needsSetup = computed(() => setupStatus.value === 'pending_setup');

  // ========================================
  // Computed - Role Properties
  // ========================================
  const roleName = computed(() => currentRole.value?.unique_name ?? null);
  const roleDisplayName = computed(() => currentRole.value?.name ?? null);

  // Role checks
  const isOwner = computed(() => isOwnerRole(currentRole.value));
  const isAdmin = computed(() => isAdminRole(currentRole.value));
  const isViewer = computed(() => currentRole.value?.is_viewer ?? false);

  // Permission checks
  const canManageForms = computed(() => currentRole.value?.can_manage_forms ?? false);
  const canManageTestimonials = computed(() => currentRole.value?.can_manage_testimonials ?? false);
  const canManageWidgets = computed(() => currentRole.value?.can_manage_widgets ?? false);
  const canManageMembers = computed(() => currentRole.value?.can_manage_members ?? false);
  const canManageBilling = computed(() => currentRole.value?.can_manage_billing ?? false);
  const canDeleteOrg = computed(() => currentRole.value?.can_delete_org ?? false);

  // ========================================
  // Computed - Combined Checks
  // ========================================
  /**
   * Returns true if setup is pending AND user has admin privileges (owner or org_admin)
   * Used to show setup indicators in the UI
   */
  const showSetupIndicator = computed(() => needsSetup.value && isAdmin.value);

  // ========================================
  // Actions
  // ========================================
  function setCurrentOrganization(organization: UserDefaultOrganization | null) {
    currentOrganization.value = organization;
  }

  function setCurrentRole(role: OrganizationRole | null) {
    currentRole.value = role;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function reset() {
    currentOrganization.value = null;
    currentRole.value = null;
    isLoading.value = false;
  }

  return {
    // State (readonly)
    currentOrganization: readonly(currentOrganization),
    currentRole: readonly(currentRole),
    isLoading: readonly(isLoading),

    // Organization computed
    organizationId,
    organizationSlug,
    organizationName,
    setupStatus,
    needsSetup,

    // Role computed
    roleName,
    roleDisplayName,
    isOwner,
    isAdmin,
    isViewer,

    // Permission computed
    canManageForms,
    canManageTestimonials,
    canManageWidgets,
    canManageMembers,
    canManageBilling,
    canDeleteOrg,

    // Combined checks
    showSetupIndicator,

    // Actions
    setCurrentOrganization,
    setCurrentRole,
    setLoading,
    reset,
  };
});
