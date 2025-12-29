import type { CorsOptions } from 'hono/cors';
import { env } from './env';

const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());

export const corsConfig: CorsOptions = {
  origin: (origin) => {
    if (!origin) return allowedOrigins[0];
    if (allowedOrigins.includes(origin)) return origin;
    if (env.NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
      return origin;
    }
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
  credentials: true,
};
