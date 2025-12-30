import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

// Get token function - will be set by auth module
let getTokenFn: (() => string | null) | null = null

/**
 * Set the token getter function
 * Called by auth module during initialization
 */
export function setTokenGetter(fn: () => string | null) {
  getTokenFn = fn
}

/**
 * Get the current auth token
 */
function getToken(): string | null {
  return getTokenFn ? getTokenFn() : null
}

// GraphQL endpoint from environment
const graphqlEndpoint =
  import.meta.env.VITE_HASURA_GRAPHQL_ENDPOINT ||
  'http://localhost:8080/v1/graphql'

// HTTP Link - Makes the actual HTTP requests
const httpLink = createHttpLink({
  uri: graphqlEndpoint,
})

// Error Link - Handles GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)

    // Check for authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      console.warn('Authentication error - token may be expired')
    }
  }
})

// Auth Link - Adds authorization header to requests
const authLink = setContext((_, { headers }) => {
  const token = getToken()

  if (token) {
    return {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    }
  }

  return { headers }
})

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    // Add type policies for pagination etc. as needed
  },
})

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})
