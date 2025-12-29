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

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'),

  // Supabase
  SUPABASE_URL: getEnvVar('SUPABASE_URL', ''),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),

  // Hasura
  HASURA_URL: getEnvVar('HASURA_URL', 'http://localhost:8080/v1/graphql'),
  HASURA_ADMIN_SECRET: getEnvVar('HASURA_ADMIN_SECRET', ''),

  // OpenAI
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', ''),

  // Frontend
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),

  // CORS
  CORS_ALLOWED_ORIGINS: getEnvVar('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'),
};
