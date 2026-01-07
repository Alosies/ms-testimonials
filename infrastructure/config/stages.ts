/**
 * Stage Configuration
 *
 * Defines environment-specific settings for dev, qa, and prod
 *
 * Account Structure:
 * - Testimonials-Dev (378257622586): dev
 * - Testimonials-QA (745791801068): qa
 * - Testimonials-Prod (405062306867): prod
 */

export type Stage = 'dev' | 'qa' | 'prod';

export interface StageConfig {
  stage: Stage;
  account: string;
  region: string;
  bucketName: string;
  apiBaseUrl: string;
  /** AWS CLI profile to use for deployments */
  profile: string;
  /** Secret for webhook HMAC signing (from environment or SSM) */
  webhookSecret?: string;
}

/**
 * Get configuration for a specific stage
 */
export function getStageConfig(stage: Stage): StageConfig {
  const configs: Record<Stage, StageConfig> = {
    dev: {
      stage: 'dev',
      account: '378257622586', // Testimonials-Dev
      region: 'ap-south-1',
      bucketName: 'testimonials-dev-uploads',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
      profile: 'testimonials-dev',
      webhookSecret: process.env.AWS_LAMBDA_MEDIA_WEBHOOK_SECRET || 'dev-webhook-secret',
    },
    qa: {
      stage: 'qa',
      account: '745791801068', // Testimonials-QA
      region: 'ap-south-1',
      bucketName: 'testimonials-qa-uploads',
      apiBaseUrl: process.env.API_BASE_URL || 'https://qa-api.testimonials.app',
      profile: 'testimonials-qa',
    },
    prod: {
      stage: 'prod',
      account: '405062306867', // Testimonials-Prod
      region: 'ap-south-1',
      bucketName: 'testimonials-prod-uploads',
      apiBaseUrl: 'https://api.testimonials.app',
      profile: 'testimonials-prod',
    },
  };

  return configs[stage];
}
