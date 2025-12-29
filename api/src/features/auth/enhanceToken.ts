import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import { GraphQLClient } from 'graphql-request';
import { env } from '@/config/env';

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

interface EnhanceTokenRequest {
  supabaseToken: string;
}

interface EnhanceTokenResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Enhance Supabase token with Hasura JWT claims
 *
 * Flow:
 * 1. Validate Supabase token
 * 2. Get or create user in our database
 * 3. Generate new JWT with Hasura claims
 */
export async function enhanceToken(request: EnhanceTokenRequest): Promise<EnhanceTokenResponse> {
  // Initialize Supabase client
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Verify Supabase token and get user
  const { data: { user }, error } = await supabase.auth.getUser(request.supabaseToken);

  if (error || !user) {
    throw new Error('Invalid Supabase token');
  }

  // Get or create user in our database
  const dbUser = await getOrCreateUser(user);

  // Generate enhanced JWT with Hasura claims
  const token = generateEnhancedToken(dbUser);

  return {
    token,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
    },
  };
}

interface DbUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

async function getOrCreateUser(supabaseUser: SupabaseUser): Promise<DbUser> {
  const client = new GraphQLClient(env.HASURA_URL, {
    headers: {
      'x-hasura-admin-secret': env.HASURA_ADMIN_SECRET,
    },
  });

  // Try to find existing user
  const findQuery = `
    query FindUser($supabaseId: String!) {
      users(where: { supabase_id: { _eq: $supabaseId } }) {
        id
        email
        name
        plan
      }
    }
  `;

  const findResult = await client.request<{ users: DbUser[] }>(findQuery, {
    supabaseId: supabaseUser.id,
  });

  if (findResult.users.length > 0) {
    return findResult.users[0];
  }

  // Create new user
  const createQuery = `
    mutation CreateUser($email: String!, $supabaseId: String!, $name: String) {
      insert_users_one(object: {
        email: $email,
        supabase_id: $supabaseId,
        name: $name
      }) {
        id
        email
        name
        plan
      }
    }
  `;

  const createResult = await client.request<{ insert_users_one: DbUser }>(createQuery, {
    email: supabaseUser.email,
    supabaseId: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || null,
  });

  return createResult.insert_users_one;
}

function generateEnhancedToken(user: DbUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    'https://hasura.io/jwt/claims': {
      'x-hasura-user-id': user.id,
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user', 'anonymous'],
    },
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}
