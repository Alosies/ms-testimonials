/**
 * Google Credential Verification
 *
 * Verifies Google One Tap JWT credentials server-side using google-auth-library.
 * Used by public endpoints to identify customers for audit trails and rate limiting.
 *
 * @see ADR-023 Decision 8a: Customer Identity via Google JWT
 */

import { OAuth2Client } from 'google-auth-library';

/**
 * Verified customer identity extracted from a Google JWT
 */
export interface VerifiedCustomer {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

/** Lazily initialized OAuth2 client */
let oauthClient: OAuth2Client | null = null;

function getOAuthClient(): OAuth2Client {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return oauthClient;
}

/**
 * Verify a Google One Tap credential (id_token) server-side.
 *
 * Validates: issuer, audience (GOOGLE_CLIENT_ID), expiration, signature.
 * Returns null on any failure — caller treats failure as anonymous.
 *
 * @param credential - Raw Google One Tap JWT (id_token)
 * @returns Verified customer info, or null if invalid/expired
 */
export async function verifyGoogleCredential(
  credential: string
): Promise<VerifiedCustomer | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('GOOGLE_CLIENT_ID env var not set, skipping credential verification');
    return null;
  }

  try {
    const client = getOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) return null;

    const { sub, email, name, picture } = payload;
    if (!sub || !email || !name) return null;

    return {
      googleId: sub,
      email,
      name,
      picture: picture ?? undefined,
    };
  } catch (error) {
    // Log but don't throw — invalid/expired tokens are treated as anonymous
    console.warn('Google credential verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}
