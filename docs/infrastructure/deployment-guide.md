# Infrastructure Deployment Guide

## Doc Connections
**ID**: `infra-deployment-guide`

2026-01-06-1200 IST

**Parent ReadMes**:
- `infra-index` - Infrastructure documentation index

**Related ReadMes**:
- `infra-aws-overview` - AWS account structure
- `infra-service-patterns` - Service naming conventions

---

This guide covers deploying AWS infrastructure for Testimonials using AWS CDK.

## Prerequisites

1. **AWS CLI** configured with profiles (see [AWS Overview](./aws-overview.md))
2. **Node.js** 20.x or later
3. **pnpm** package manager
4. **AWS CDK** CLI: `npm install -g aws-cdk`

Verify setup:

```bash
# Check AWS access
aws sts get-caller-identity --profile testimonials-prod
aws sts get-caller-identity --profile testimonials-nonprod

# Check CDK version
cdk --version
```

## Project Structure

```
infrastructure/
├── bin/
│   └── app.ts                    # CDK app entry point
├── config/
│   ├── stages.ts                 # Stage configurations (dev/qa/prod)
│   └── index.ts
├── constructs/
│   ├── lambda.ts                 # Lambda utilities
│   ├── s3.ts                     # S3 utilities
│   └── index.ts
├── stacks/
│   ├── storage-stack.ts          # S3 buckets, etc.
│   ├── processing-stack.ts       # Lambda functions
│   └── index.ts
├── lambdas/
│   └── image-processor/          # Lambda function code
│       ├── index.ts
│       ├── package.json
│       └── tsconfig.json
├── cdk.json                      # CDK configuration
├── package.json                  # CDK dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Initial Setup

### 1. Create Infrastructure Directory

```bash
# From project root
mkdir -p infrastructure/{bin,config,constructs,stacks,lambdas}
cd infrastructure
```

### 2. Initialize Package

```bash
pnpm init
pnpm add aws-cdk-lib constructs
pnpm add -D typescript @types/node ts-node
```

### 3. Create CDK Configuration

**cdk.json**
```json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "watch": {
    "include": ["**"],
    "exclude": [
      "README.md",
      "cdk*.json",
      "**/*.d.ts",
      "**/*.js",
      "tsconfig.json",
      "package*.json",
      "node_modules",
      "lambdas/**/node_modules"
    ]
  },
  "context": {
    "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
    "@aws-cdk/core:stackRelativeExports": true
  }
}
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": false,
    "inlineSourceMap": true,
    "inlineSources": true,
    "experimentalDecorators": true,
    "strictPropertyInitialization": false,
    "outDir": "./dist",
    "rootDir": "./"
  },
  "exclude": ["node_modules", "dist", "lambdas"]
}
```

### 4. Create Stage Configuration

**config/stages.ts**
```typescript
export type Stage = 'dev' | 'qa' | 'prod';

export interface StageConfig {
  stage: Stage;
  account: string;
  region: string;
  bucketName: string;
  apiBaseUrl: string;
  profile: string;
}

export function getStageConfig(stage: Stage): StageConfig {
  const configs: Record<Stage, StageConfig> = {
    dev: {
      stage: 'dev',
      account: '378257622586',  // Testimonials-Dev
      region: 'ap-south-1',
      bucketName: 'testimonials-dev-uploads',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
      profile: 'testimonials-dev',
    },
    qa: {
      stage: 'qa',
      account: '745791801068',  // Testimonials-QA
      region: 'ap-south-1',
      bucketName: 'testimonials-qa-uploads',
      apiBaseUrl: process.env.API_BASE_URL || 'https://qa-api.testimonials.app',
      profile: 'testimonials-qa',
    },
    prod: {
      stage: 'prod',
      account: '405062306867',  // Testimonials-Prod
      region: 'ap-south-1',
      bucketName: 'testimonials-prod-uploads',
      apiBaseUrl: 'https://api.testimonials.app',
      profile: 'testimonials-prod',
    },
  };

  return configs[stage];
}
```

**config/index.ts**
```typescript
export * from './stages';
```

### 5. Create CDK App Entry Point

**bin/app.ts**
```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getStageConfig, type Stage } from '../config';
import { createStorageStack } from '../stacks';

const app = new cdk.App();

// Get stage from context or default to 'dev'
const stage = (app.node.tryGetContext('stage') || 'dev') as Stage;
const config = getStageConfig(stage);

// Create stacks
createStorageStack(app, `TestimonialsStorage-${stage}`, {
  stage,
  env: {
    account: config.account,
    region: config.region,
  },
});

app.synth();
```

### 6. Add Package Scripts

**package.json**
```json
{
  "name": "testimonials-infrastructure",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "synth": "cdk synth",
    "synth:dev": "cdk synth -c stage=dev",
    "synth:qa": "cdk synth -c stage=qa",
    "synth:prod": "cdk synth -c stage=prod",
    "diff:dev": "cdk diff -c stage=dev --profile testimonials-dev",
    "diff:qa": "cdk diff -c stage=qa --profile testimonials-qa",
    "diff:prod": "cdk diff -c stage=prod --profile testimonials-prod",
    "deploy:dev": "cdk deploy --all -c stage=dev --profile testimonials-dev --require-approval never",
    "deploy:qa": "cdk deploy --all -c stage=qa --profile testimonials-qa --require-approval never",
    "deploy:prod": "cdk deploy --all -c stage=prod --profile testimonials-prod",
    "destroy:dev": "cdk destroy --all -c stage=dev --profile testimonials-dev",
    "destroy:qa": "cdk destroy --all -c stage=qa --profile testimonials-qa",
    "destroy:prod": "cdk destroy --all -c stage=prod --profile testimonials-prod",
    "bootstrap:dev": "cdk bootstrap aws://378257622586/ap-south-1 --profile testimonials-dev",
    "bootstrap:qa": "cdk bootstrap aws://745791801068/ap-south-1 --profile testimonials-qa",
    "bootstrap:prod": "cdk bootstrap aws://405062306867/ap-south-1 --profile testimonials-prod"
  }
}
```

## Deployment Workflow

### Environment Overview

| Environment | Account | Profile | Auto-Approve |
|-------------|---------|---------|--------------|
| Dev | Testimonials-Dev (378257622586) | `testimonials-dev` | Yes |
| QA | Testimonials-QA (745791801068) | `testimonials-qa` | Yes |
| Prod | Testimonials-Prod (405062306867) | `testimonials-prod` | No |

### Initial Bootstrap (One-Time per Account)

```bash
cd infrastructure

# Bootstrap each account
pnpm bootstrap:dev
pnpm bootstrap:qa
pnpm bootstrap:prod
```

### Development Deployment

```bash
cd infrastructure

# Preview changes
pnpm diff:dev

# Deploy (auto-approves)
pnpm deploy:dev

# Verify
aws s3 ls --profile testimonials-dev
```

### QA Deployment

```bash
cd infrastructure

# Preview changes
pnpm diff:qa

# Deploy (auto-approves)
pnpm deploy:qa

# Verify
aws s3 ls --profile testimonials-qa
```

### Production Deployment

```bash
cd infrastructure

# ALWAYS preview changes before prod deploy
pnpm diff:prod

# Deploy (will prompt for approval)
pnpm deploy:prod

# Verify
aws s3 ls --profile testimonials-prod
```

### Typical Workflow

```
1. Develop locally
       ↓
2. pnpm deploy:dev    → Test in dev
       ↓
3. pnpm deploy:qa     → QA validation
       ↓
4. pnpm deploy:prod   → Production release
```

## Creating New Stacks

### Example: Storage Stack

**stacks/storage-stack.ts**
```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import { getStageConfig, type Stage } from '../config';

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
  const uploadsBucket = new s3.Bucket(stack, 'UploadsBucket', {
    bucketName: config.bucketName,
    versioned: false,
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    cors: [{
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
      allowedOrigins: props.stage === 'prod'
        ? ['https://testimonials.app', 'https://app.testimonials.app']
        : ['http://localhost:*', 'https://*.vercel.app'],
      allowedHeaders: ['*'],
      maxAge: 3600,
    }],
    removalPolicy: props.stage === 'prod'
      ? cdk.RemovalPolicy.RETAIN
      : cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: props.stage !== 'prod',
  });

  // Add tags
  cdk.Tags.of(stack).add('Environment', props.stage);
  cdk.Tags.of(stack).add('Product', 'testimonials');
  cdk.Tags.of(stack).add('Owner', 'alosies');

  // Outputs
  new cdk.CfnOutput(stack, 'BucketName', {
    value: uploadsBucket.bucketName,
    description: 'S3 bucket for uploads',
  });

  new cdk.CfnOutput(stack, 'BucketArn', {
    value: uploadsBucket.bucketArn,
    description: 'S3 bucket ARN',
  });

  return stack;
}
```

**stacks/index.ts**
```typescript
export * from './storage-stack';
```

## Adding Lambda Functions

### 1. Create Lambda Directory

```bash
mkdir -p lambdas/image-processor
cd lambdas/image-processor
pnpm init
pnpm add @aws-sdk/client-s3 sharp
pnpm add -D @types/aws-lambda typescript
```

### 2. Write Lambda Code

**lambdas/image-processor/index.ts**
```typescript
import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({});

export async function handler(event: S3Event): Promise<void> {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Skip if already processed
    if (key.includes('/thumbnails/')) continue;

    console.log(`Processing: s3://${bucket}/${key}`);

    // Get original image
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const imageBuffer = Buffer.from(await Body!.transformToByteArray());

    // Create thumbnail
    const thumbnail = await sharp(imageBuffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload thumbnail
    const thumbnailKey = key.replace(/\/([^/]+)$/, '/thumbnails/$1');
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/jpeg',
    }));

    console.log(`Created thumbnail: s3://${bucket}/${thumbnailKey}`);
  }
}
```

### 3. Compile Lambda

```bash
cd lambdas/image-processor
npx tsc index.ts --lib es2020 --module commonjs --target es2020 --esModuleInterop
```

### 4. Add to Stack

**stacks/processing-stack.ts**
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import type { Construct } from 'constructs';
import { getStageConfig, type Stage } from '../config';
import * as path from 'path';

export interface ProcessingStackProps extends cdk.StackProps {
  stage: Stage;
  uploadsBucket: s3.IBucket;
}

export function createProcessingStack(
  scope: Construct,
  id: string,
  props: ProcessingStackProps
): cdk.Stack {
  const stack = new cdk.Stack(scope, id, props);
  const config = getStageConfig(props.stage);

  // Image processor Lambda
  const imageProcessor = new lambda.Function(stack, 'ImageProcessor', {
    functionName: `testimonials-${props.stage}-image-processor`,
    runtime: lambda.Runtime.NODEJS_20_X,
    architecture: lambda.Architecture.ARM_64,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas/image-processor')),
    memorySize: 1024,
    timeout: cdk.Duration.seconds(60),
    environment: {
      STAGE: props.stage,
      BUCKET_NAME: props.uploadsBucket.bucketName,
    },
  });

  // Grant S3 permissions
  props.uploadsBucket.grantReadWrite(imageProcessor);

  // Add S3 trigger
  props.uploadsBucket.addEventNotification(
    s3.EventType.OBJECT_CREATED,
    new s3n.LambdaDestination(imageProcessor),
    { prefix: '', suffix: '.jpg' }
  );

  // Tags
  cdk.Tags.of(stack).add('Environment', props.stage);
  cdk.Tags.of(stack).add('Product', 'testimonials');

  return stack;
}
```

## Troubleshooting

### CDK Bootstrap Failed

```bash
# Check if bootstrap stack exists
aws cloudformation describe-stacks --stack-name CDKToolkit --profile testimonials-nonprod

# Re-bootstrap with specific version
cdk bootstrap aws://380029909113/ap-south-1 \
  --profile testimonials-nonprod \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

### Deployment Stuck

```bash
# View stack events
aws cloudformation describe-stack-events \
  --stack-name TestimonialsStorage-dev \
  --profile testimonials-nonprod

# Cancel update (if stuck)
aws cloudformation cancel-update-stack \
  --stack-name TestimonialsStorage-dev \
  --profile testimonials-nonprod
```

### Lambda Not Triggering

```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/testimonials-dev-image-processor \
  --follow --profile testimonials-nonprod

# Check S3 notification configuration
aws s3api get-bucket-notification-configuration \
  --bucket testimonials-dev-uploads \
  --profile testimonials-nonprod
```

### Permission Denied

```bash
# Verify current identity
aws sts get-caller-identity --profile testimonials-nonprod

# Check role assumption works
aws sts assume-role \
  --role-arn arn:aws:iam::380029909113:role/OrganizationAccountAccessRole \
  --role-session-name test
```

## Best Practices

1. **Always diff before deploy**: `pnpm diff:dev` before `pnpm deploy:dev`
2. **Deploy to dev first**: Never deploy directly to prod
3. **Use meaningful stack names**: Include environment in name
4. **Tag everything**: Use Environment, Product, Owner tags
5. **Retain prod resources**: Use `RemovalPolicy.RETAIN` in prod
6. **Review IAM permissions**: Check Lambda roles for least privilege
7. **Monitor deployments**: Watch CloudFormation events during deploy

## Related Documentation

- [AWS Overview](./aws-overview.md) - Account structure and access
- [Service Patterns](./service-patterns.md) - AWS service conventions
