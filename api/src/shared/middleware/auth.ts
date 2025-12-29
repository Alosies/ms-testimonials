import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export interface JWTPayload {
  sub: string;
  email: string;
  'https://hasura.io/jwt/claims'?: {
    'x-hasura-user-id': string;
    'x-hasura-default-role': string;
    'x-hasura-allowed-roles': string[];
  };
  iat: number;
  exp: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authentication middleware
 * Validates JWT token and adds user context to request
 */
export const authMiddleware = createMiddleware<{
  Variables: {
    auth: AuthContext;
  };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    const hasuraClaims = decoded['https://hasura.io/jwt/claims'];

    if (!hasuraClaims) {
      throw new HTTPException(401, { message: 'Invalid token: missing Hasura claims' });
    }

    c.set('auth', {
      userId: hasuraClaims['x-hasura-user-id'],
      email: decoded.email,
      role: hasuraClaims['x-hasura-default-role'],
    });

    await next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HTTPException(401, { message: 'Invalid token' });
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new HTTPException(401, { message: 'Token expired' });
    }
    throw error;
  }
});

/**
 * Optional auth middleware
 * Validates JWT if present, but doesn't require it
 */
export const optionalAuthMiddleware = createMiddleware<{
  Variables: {
    auth?: AuthContext;
  };
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    await next();
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    const hasuraClaims = decoded['https://hasura.io/jwt/claims'];

    if (hasuraClaims) {
      c.set('auth', {
        userId: hasuraClaims['x-hasura-user-id'],
        email: decoded.email,
        role: hasuraClaims['x-hasura-default-role'],
      });
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }

  await next();
});
