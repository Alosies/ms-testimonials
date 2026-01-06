/**
 * S3 Construct Utilities
 *
 * Reusable functions for creating S3 buckets
 */

import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { Stage } from '../config';

export interface BucketConfig {
  id: string;
  bucketName: string;
  stage: Stage;
  corsOrigins?: string[];
  versioned?: boolean;
}

/**
 * Create an S3 bucket with sensible defaults
 */
export function createBucket(scope: Construct, config: BucketConfig): s3.Bucket {
  const defaultCorsOrigins =
    config.stage === 'prod'
      ? ['https://testimonials.app', 'https://app.testimonials.app']
      : ['http://localhost:*', 'https://*.vercel.app'];

  return new s3.Bucket(scope, config.id, {
    bucketName: config.bucketName,
    versioned: config.versioned ?? false,
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    cors: [
      {
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
        allowedOrigins: config.corsOrigins ?? defaultCorsOrigins,
        allowedHeaders: ['*'],
        maxAge: 3600,
      },
    ],
    lifecycleRules: [
      {
        id: 'DeleteIncompleteMultipartUploads',
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
      },
    ],
    removalPolicy:
      config.stage === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: config.stage !== 'prod',
  });
}
