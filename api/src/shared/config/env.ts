import 'dotenv/config';

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '4000'), 10),
  API_URL: getEnvVar('API_URL', 'http://localhost:4000'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'),

  // Supabase
  SUPABASE_URL: getEnvVar('SUPABASE_URL', ''),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),

  // Hasura
  HASURA_URL: getEnvVar('HASURA_URL', 'http://localhost:8080/v1/graphql'),
  HASURA_ADMIN_SECRET: getEnvVar('HASURA_ADMIN_SECRET', ''),

  // AI Providers
  AI_PROVIDER: getEnvVar('AI_PROVIDER', 'openai'), // 'openai', 'anthropic', or 'google'
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', ''),
  ANTHROPIC_API_KEY: getEnvVar('ANTHROPIC_API_KEY', ''),
  GOOGLE_API_KEY: getEnvVar('GOOGLE_API_KEY', ''),

  // Frontend
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),

  // CORS - Allow all worktree ports (3000 main, 3001 yellow, 3002 green, 3003 blue)
  CORS_ALLOWED_ORIGINS: getEnvVar('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003'),

  // AWS S3 (Media Upload)
  // Credentials: Use AWS_PROFILE for local dev, or explicit keys for production
  AWS_PROFILE: getEnvVar('AWS_PROFILE', ''),
  AWS_REGION: getEnvVar('AWS_REGION', 'ap-south-1'),
  AWS_ACCESS_KEY_ID: getEnvVar('AWS_ACCESS_KEY_ID', ''),
  AWS_SECRET_ACCESS_KEY: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
  S3_MEDIA_BUCKET: getEnvVar('S3_MEDIA_BUCKET', 'testimonials-dev-uploads'),

  // CDN (ImageKit)
  CDN_BASE_URL: getEnvVar('CDN_BASE_URL', ''),
  CDN_PATH_PREFIX: getEnvVar('CDN_PATH_PREFIX', ''),

  // AWS Lambda Media Webhook (Lambda uses this secret to authenticate callbacks)
  AWS_LAMBDA_MEDIA_WEBHOOK_SECRET: getEnvVar('AWS_LAMBDA_MEDIA_WEBHOOK_SECRET', 'dev-webhook-secret'),

  // E2E Testing Support
  // These enable the /e2e/* endpoints for Playwright tests
  E2E_API_SECRET: getEnvVar('E2E_API_SECRET', ''),
  E2E_USER_ID: getEnvVar('E2E_USER_ID', ''),
  E2E_USER_EMAIL: getEnvVar('E2E_USER_EMAIL', ''),
  E2E_ORGANIZATION_ID: getEnvVar('E2E_ORGANIZATION_ID', ''),
  E2E_ORGANIZATION_SLUG: getEnvVar('E2E_ORGANIZATION_SLUG', ''),
};
