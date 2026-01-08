import { watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrentContextStore } from '../store';
import { useAuth } from '@/features/auth';
import { useGetUserDefaultOrganization, useOrganizationStore } from '@/entities/organization';
import type { CurrentOrganization } from '../models';

/**
 * Composable to initialize and sync the current context
 *
 * This should be called once in App.vue or a root layout component
 * to sync auth state with the context store and fetch the user's
 * default organization.
 */
export function useCurrentContext() {
  const router = useRouter();
  const contextStore = useCurrentContextStore();
  const organizationStore = useOrganizationStore();
  const { currentUser, isAuthenticated, isInitialized } = useAuth();

  // Reactive variables that update when currentUser changes
  const orgQueryVariables = computed(() => ({
    userId: currentUser.value?.id ?? '',
  }));

  const { organization: defaultOrg, role: userRole, isLoading: isOrgLoading } =
    useGetUserDefaultOrganization(orgQueryVariables);

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
        organizationStore.reset();
      }
    },
    { immediate: true },
  );

  // Watch for organization changes - sync to both stores and handle redirect
  watch(
    defaultOrg,
    newOrg => {
      if (newOrg) {
        // Sync to CurrentContext store (simplified interface)
        const org: CurrentOrganization = {
          id: newOrg.id,
          name: newOrg.name,
          slug: newOrg.slug,
          logoUrl: newOrg.logo?.storage_path ?? null,
          setupStatus: newOrg.setup_status as 'pending_setup' | 'completed',
        };
        contextStore.setCurrentOrganization(org);

        // Sync to Organization store (full organization data)
        organizationStore.setCurrentOrganization(newOrg);

        // Redirect authenticated users from root to org dashboard
        // This handles the case where user was on '/' waiting for org to load
        if (router.currentRoute.value.path === '/' && isAuthenticated.value) {
          router.replace(`/${newOrg.slug}/dashboard`);
        }
      }
    },
    { immediate: true },
  );

  // Watch for role changes - sync to organization store
  watch(
    userRole,
    newRole => {
      organizationStore.setCurrentRole(newRole);
    },
    { immediate: true },
  );

  // Watch loading state
  watch(
    isOrgLoading,
    loading => {
      contextStore.setLoading(loading);
      organizationStore.setLoading(loading);
    },
    { immediate: true },
  );

  // Mark context as ready when auth is initialized and org is loaded (or no user)
  // This prevents flash of empty state while data is loading
  watch(
    [isInitialized, isOrgLoading, isAuthenticated],
    ([authInit, orgLoading, authenticated]) => {
      // Only mark ready when:
      // 1. Auth has been initialized, AND
      // 2. Either: user is not authenticated (no org to load) OR org loading is done
      if (authInit && (!authenticated || !orgLoading)) {
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
