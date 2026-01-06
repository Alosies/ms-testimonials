/**
 * Lambda Construct Utilities
 *
 * Reusable functions for creating Lambda functions
 */

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import * as path from 'path';

export interface LambdaConfig {
  id: string;
  functionName: string;
  codePath: string;
  handler?: string;
  runtime?: lambda.Runtime;
  architecture?: lambda.Architecture;
  memorySize?: number;
  timeout?: number;
  environment?: Record<string, string>;
}

/**
 * Create a Lambda function with sensible defaults
 */
export function createLambda(
  scope: Construct,
  config: LambdaConfig
): lambda.Function {
  return new lambda.Function(scope, config.id, {
    functionName: config.functionName,
    runtime: config.runtime ?? lambda.Runtime.NODEJS_20_X,
    architecture: config.architecture ?? lambda.Architecture.ARM_64,
    handler: config.handler ?? 'index.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas', config.codePath)
    ),
    memorySize: config.memorySize ?? 512,
    timeout: cdk.Duration.seconds(config.timeout ?? 30),
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      ...config.environment,
    },
    tracing: lambda.Tracing.ACTIVE,
  });
}
