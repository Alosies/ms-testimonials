/**
 * Storage Stack
 *
 * S3 buckets and storage-related resources
 */

import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
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

  // S3 Bucket for uploads
  const uploadsBucket = createBucket(stack, {
    id: 'UploadsBucket',
    bucketName: config.bucketName,
    stage: props.stage,
  });

  // Add tags
  cdk.Tags.of(stack).add('Environment', props.stage);
  cdk.Tags.of(stack).add('Product', 'testimonials');
  cdk.Tags.of(stack).add('Owner', 'alosies');

  // Outputs
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

  return stack;
}
