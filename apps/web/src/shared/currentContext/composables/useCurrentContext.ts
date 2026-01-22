import { watch, computed, toRefs } from 'vue';
import { useCurrentContextStore } from '../store';
import { useAuth } from '@/features/auth';
import { useOrganizationStore } from '@/entities/organization';
import type { CurrentOrganization } from '../models';

/**
 * Composable to initialize and sync the current context
 *
 * This should be called once in App.vue or a root layout component.
 * Organization data is fetched by useOrganizationStore directly.
 * This composable syncs auth/org state to contextStore and manages ready state.
 */
export function useCurrentContext() {
  const contextStore = useCurrentContextStore();
  const organizationStore = useOrganizationStore();
  const { currentUser, isAuthenticated, isInitialized } = useAuth();

  // Get reactive refs from organization store
  const { currentOrganization, isLoading: isOrgLoading } = toRefs(organizationStore);

  // Watch for auth changes and sync to context store
  watch(
    currentUser,
    newUser => {
      if (newUser) {
        contextStore.setCurrentUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.display_name,
        });
      } else {
        contextStore.reset();
      }
    },
    { immediate: true },
  );

  // Watch organization store and sync to context store (simplified interface)
  watch(
    currentOrganization,
    newOrg => {
      if (newOrg) {
        const org: CurrentOrganization = {
          id: newOrg.id,
          name: newOrg.name,
          slug: newOrg.slug,
          logoUrl: newOrg.logo?.storage_path ?? null,
          setupStatus: newOrg.setup_status as 'pending_setup' | 'completed',
        };
        contextStore.setCurrentOrganization(org);
      } else {
        contextStore.setCurrentOrganization(null);
      }
    },
    { immediate: true },
  );

  // Watch loading state and sync to context store
  watch(
    isOrgLoading,
    loading => {
      contextStore.setLoading(loading);
    },
    { immediate: true },
  );

  // Mark context as ready when auth is initialized and org is loaded (or no user)
  watch(
    [isInitialized, isOrgLoading, isAuthenticated, currentOrganization],
    ([authInit, orgLoading, authenticated, org]) => {
      const orgSlug = org?.slug ?? null;

      // Mark ready when:
      // 1. Auth has been initialized, AND
      // 2. Either: user is not authenticated (no org to load) OR org is loaded
      if (authInit && (!authenticated || (orgSlug && !orgLoading))) {
        contextStore.markAsReady();
      }
    },
    { immediate: true },
  );

  return {
    // From context store
    user: computed(() => contextStore.user),
    organization: computed(() => contextStore.organization),
    isLoading: computed(() => contextStore.isLoading),
    isReady: computed(() => contextStore.isReady),
    currentUserId: contextStore.currentUserId,
    currentOrganizationId: contextStore.currentOrganizationId,
    currentOrganizationSlug: contextStore.currentOrganizationSlug,
    needsSetup: contextStore.needsSetup,

    // From organization store
    currentRole: computed(() => organizationStore.currentRole),
    isAdmin: organizationStore.isAdmin,
    isOwner: organizationStore.isOwner,
    showSetupIndicator: organizationStore.showSetupIndicator,

    // From auth
    isAuthenticated,
    isInitialized,
  };
}
