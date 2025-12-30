import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useTokenManager } from '@/shared/authorization';

// GraphQL endpoint from environment
const graphqlEndpoint =
  import.meta.env.VITE_HASURA_GRAPHQL_ENDPOINT ||
  'http://localhost:8080/v1/graphql';

// HTTP Link - Makes the actual HTTP requests
const httpLink = createHttpLink({
  uri: graphqlEndpoint,
});

// Create token manager instance for Apollo client
const { getValidEnhancedToken } = useTokenManager();

// Auth Link - Adds authorization header to requests (async to wait for token)
const authLink = setContext(async (_, { headers }) => {
  try {
    // Get the enhanced token (automatically handles refresh if needed)
    const enhancedToken = await getValidEnhancedToken();

    if (enhancedToken) {
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${enhancedToken}`,
        },
      };
    }

    return { headers };
  } catch (error) {
    console.error('Error getting enhanced auth token:', error);
    return { headers };
  }
});

// Error Link - Handles GraphQL and network errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Check for authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      console.warn('Authentication error - token may be expired');
    }
  }
});

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    // Add type policies for pagination etc. as needed
  },
});

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
});
