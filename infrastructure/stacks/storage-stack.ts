/**
 * Storage Stack
 *
 * S3 buckets, Lambda validators, and storage-related resources
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import * as path from 'path';
import { getStageConfig, type Stage } from '../config';
import { createBucket } from '../constructs';

export interface StorageStackProps extends cdk.StackProps {
  stage: Stage;
}

export function createStorageStack(
  scope: Construct,
  id: string,
  props: StorageStackProps
): cdk.Stack {
  const stack = new cdk.Stack(scope, id, props);
  const config = getStageConfig(props.stage);

  // ============================================================
  // S3 BUCKET
  // ============================================================

  const uploadsBucket = createBucket(stack, {
    id: 'UploadsBucket',
    bucketName: config.bucketName,
    stage: props.stage,
  });

  // ============================================================
  // MEDIA VALIDATOR LAMBDA
  // ============================================================

  // Lambda function for validating uploaded media
  const mediaValidator = new lambda.Function(stack, 'MediaValidator', {
    functionName: `testimonials-${props.stage}-media-validator`,
    description: 'Validates uploaded media files and calls webhook',
    runtime: lambda.Runtime.NODEJS_20_X,
    architecture: lambda.Architecture.ARM_64,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas/media-validator/dist')
    ),
    memorySize: 1024, // Higher memory for image processing with sharp
    timeout: cdk.Duration.seconds(60),
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      STAGE: props.stage,
      API_BASE_URL: config.apiBaseUrl,
      WEBHOOK_SECRET: config.webhookSecret || 'dev-webhook-secret',
    },
    tracing: lambda.Tracing.ACTIVE,
    logRetention: logs.RetentionDays.TWO_WEEKS,
  });

  // Grant S3 permissions to Lambda
  uploadsBucket.grantRead(mediaValidator);
  uploadsBucket.grantDelete(mediaValidator); // For deleting invalid files

  // Add S3 event notification to trigger Lambda
  uploadsBucket.addEventNotification(
    s3.EventType.OBJECT_CREATED,
    new s3n.LambdaDestination(mediaValidator)
  );

  // ============================================================
  // TAGS
  // ============================================================

  cdk.Tags.of(stack).add('Environment', props.stage);
  cdk.Tags.of(stack).add('Product', 'testimonials');
  cdk.Tags.of(stack).add('Owner', 'alosies');

  // ============================================================
  // OUTPUTS
  // ============================================================

  new cdk.CfnOutput(stack, 'BucketName', {
    value: uploadsBucket.bucketName,
    description: 'S3 bucket for uploads',
    exportName: `testimonials-${props.stage}-uploads-bucket-name`,
  });

  new cdk.CfnOutput(stack, 'BucketArn', {
    value: uploadsBucket.bucketArn,
    description: 'S3 bucket ARN',
    exportName: `testimonials-${props.stage}-uploads-bucket-arn`,
  });

  new cdk.CfnOutput(stack, 'MediaValidatorArn', {
    value: mediaValidator.functionArn,
    description: 'Media validator Lambda ARN',
    exportName: `testimonials-${props.stage}-media-validator-arn`,
  });

  new cdk.CfnOutput(stack, 'MediaValidatorLogGroup', {
    value: mediaValidator.logGroup.logGroupName,
    description: 'Media validator CloudWatch log group',
    exportName: `testimonials-${props.stage}-media-validator-logs`,
  });

  return stack;
}
