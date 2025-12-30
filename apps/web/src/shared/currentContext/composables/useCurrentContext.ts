import { watch, ref, computed } from 'vue';
import { useCurrentContextStore } from '../store';
import { useAuth } from '@/features/auth';
import { useGetUserDefaultOrganization } from '@/entities/organization';
import type { CurrentOrganization } from '../models';

/**
 * Composable to initialize and sync the current context
 *
 * This should be called once in App.vue or a root layout component
 * to sync auth state with the context store and fetch the user's
 * default organization.
 */
export function useCurrentContext() {
  const contextStore = useCurrentContextStore();
  const { currentUser, isAuthenticated, isInitialized } = useAuth();

  const userId = computed(() => currentUser.value?.id ?? '');
  const { organization: defaultOrg, isLoading: isOrgLoading } = useGetUserDefaultOrganization(
    ref({ userId: userId.value }),
  );

  // Watch for auth changes and sync to context store
  watch(
    currentUser,
    newUser => {
      if (newUser) {
        contextStore.setCurrentUser({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        });
      } else {
        contextStore.reset();
      }
    },
    { immediate: true },
  );

  // Watch for organization changes
  watch(
    defaultOrg,
    newOrg => {
      if (newOrg) {
        const org: CurrentOrganization = {
          id: newOrg.id,
          name: newOrg.name,
          slug: newOrg.slug,
          logoUrl: newOrg.logo_url ?? null,
          setupStatus: newOrg.setup_status as 'pending_setup' | 'completed',
        };
        contextStore.setCurrentOrganization(org);
      }
    },
    { immediate: true },
  );

  // Watch loading state
  watch(
    isOrgLoading,
    loading => {
      contextStore.setLoading(loading);
    },
    { immediate: true },
  );

  return {
    // From store
    user: computed(() => contextStore.user),
    organization: computed(() => contextStore.organization),
    isLoading: computed(() => contextStore.isLoading),
    currentUserId: contextStore.currentUserId,
    currentOrganizationId: contextStore.currentOrganizationId,
    currentOrganizationSlug: contextStore.currentOrganizationSlug,
    needsSetup: contextStore.needsSetup,

    // From auth
    isAuthenticated,
    isInitialized,
  };
}
