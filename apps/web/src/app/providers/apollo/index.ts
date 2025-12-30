import type { App } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from '@/shared/lib/apollo'

/**
 * Apollo Provider Plugin
 *
 * Provides the Apollo Client to all components via Vue's provide/inject.
 * Components can use @vue/apollo-composable hooks like useQuery, useMutation.
 */
export const apolloProvider = {
  install(app: App) {
    app.provide(DefaultApolloClient, apolloClient)
  },
}
