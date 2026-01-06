# AWS Service Patterns

## Doc Connections
**ID**: `infra-service-patterns`

2026-01-06-1200 IST

**Parent ReadMes**:
- `infra-index` - Infrastructure documentation index

**Related ReadMes**:
- `infra-aws-overview` - AWS account structure
- `infra-deployment-guide` - CDK deployment workflow

---

This document defines the patterns and conventions for AWS services used in Testimonials.

## Naming Conventions

### General Pattern

```
{product}-{environment}-{service}-{purpose}
```

Where `{environment}` is one of: `dev`, `qa`, `prod`

### Examples by Environment

| Resource Type | Dev | QA | Prod |
|---------------|-----|-----|------|
| S3 Bucket | `testimonials-dev-uploads` | `testimonials-qa-uploads` | `testimonials-prod-uploads` |
| Lambda | `testimonials-dev-image-processor` | `testimonials-qa-image-processor` | `testimonials-prod-image-processor` |
| CDK Stack | `TestimonialsStorage-dev` | `TestimonialsStorage-qa` | `TestimonialsStorage-prod` |

### Service-Specific Patterns

| Service | Pattern | Dev Example | Prod Example |
|---------|---------|-------------|--------------|
| S3 Bucket | `testimonials-{env}-{purpose}` | `testimonials-dev-uploads` | `testimonials-prod-uploads` |
| Lambda | `testimonials-{env}-{function}` | `testimonials-dev-image-resize` | `testimonials-prod-image-resize` |
| RDS | `testimonials-{env}-{role}` | `testimonials-dev-primary` | `testimonials-prod-primary` |
| SQS | `testimonials-{env}-{purpose}` | `testimonials-dev-email-queue` | `testimonials-prod-email-queue` |
| SNS | `testimonials-{env}-{purpose}` | `testimonials-dev-notifications` | `testimonials-prod-notifications` |
| DynamoDB | `testimonials-{env}-{entity}` | `testimonials-dev-sessions` | `testimonials-prod-sessions` |
| SSM Parameter | `/testimonials/{env}/{key}` | `/testimonials/dev/openai/api-key` | `/testimonials/prod/openai/api-key` |

---

## S3 Buckets

### Bucket Structure

```
testimonials-{env}-uploads/
├── {organization_id}/
│   ├── testimonials/
│   │   ├── {testimonial_id}/
│   │   │   ├── avatar.jpg
│   │   │   └── video.mp4
│   ├── forms/
│   │   └── {form_id}/
│   │       └── logo.png
│   └── widgets/
│       └── {widget_id}/
│           └── background.jpg
```

### Bucket Configuration

```typescript
// CDK Pattern
const uploadsBucket = new s3.Bucket(stack, 'UploadsBucket', {
  bucketName: `testimonials-${stage}-uploads`,
  versioned: false,
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  cors: [{
    allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
    allowedOrigins: stage === 'prod'
      ? ['https://testimonials.app', 'https://app.testimonials.app']
      : ['http://localhost:*', 'https://*.vercel.app'],
    allowedHeaders: ['*'],
    maxAge: 3600,
  }],
  lifecycleRules: [{
    id: 'DeleteIncompleteMultipartUploads',
    abortIncompleteMultipartUploadAfter: Duration.days(7),
  }],
});
```

### S3 Buckets Inventory

| Bucket Name | Environment | Account | Purpose |
|-------------|-------------|---------|---------|
| `testimonials-dev-uploads` | Dev | Testimonials-Dev (378257622586) | Development uploads |
| `testimonials-qa-uploads` | QA | Testimonials-QA (745791801068) | QA testing uploads |
| `testimonials-prod-uploads` | Prod | Testimonials-Prod (405062306867) | Production uploads |

### Presigned URL Pattern

```typescript
// Generate presigned URL for upload
async function getUploadUrl(
  organizationId: string,
  fileType: 'testimonial' | 'form' | 'widget',
  entityId: string,
  filename: string
): Promise<string> {
  const key = `${organizationId}/${fileType}s/${entityId}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: `testimonials-${process.env.STAGE}-uploads`,
    Key: key,
    ContentType: getMimeType(filename),
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

---

## Lambda Functions

### Function Types

| Type | Purpose | Trigger | Example |
|------|---------|---------|---------|
| API Handler | HTTP endpoints | API Gateway/Hono | `testimonials-{env}-api` |
| Event Processor | Background processing | S3/SQS/SNS | `testimonials-{env}-image-processor` |
| Scheduled | Cron jobs | EventBridge | `testimonials-{env}-cleanup` |

### Lambda Configuration Defaults

```typescript
// CDK Pattern
const defaultLambdaConfig = {
  runtime: lambda.Runtime.NODEJS_20_X,
  architecture: lambda.Architecture.ARM_64,
  memorySize: 512,
  timeout: Duration.seconds(30),
  tracing: lambda.Tracing.ACTIVE,
  environment: {
    NODE_OPTIONS: '--enable-source-maps',
    STAGE: config.stage,
  },
};
```

### Lambda Directory Structure

```
infrastructure/
└── lambdas/
    ├── image-processor/
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    ├── video-processor/
    │   ├── index.ts
    │   ├── package.json
    │   └── tsconfig.json
    └── cleanup/
        ├── index.ts
        ├── package.json
        └── tsconfig.json
```

### Lambda Boilerplate

```typescript
// lambdas/image-processor/index.ts
import { S3Event } from 'aws-lambda';

export async function handler(event: S3Event): Promise<void> {
  console.log('Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing: s3://${bucket}/${key}`);

    // Processing logic here
  }
}
```

### Planned Lambda Functions

| Function | Purpose | Trigger | Priority |
|----------|---------|---------|----------|
| `image-processor` | Resize uploaded images | S3 event | P1 |
| `video-processor` | Transcode videos | S3 event | P2 |
| `cleanup` | Delete orphaned files | EventBridge (daily) | P3 |
| `email-sender` | Send notification emails | SQS | P2 |

---

## SQS Queues

### Queue Pattern

```typescript
// CDK Pattern
const emailQueue = new sqs.Queue(stack, 'EmailQueue', {
  queueName: `testimonials-${stage}-email-queue`,
  visibilityTimeout: Duration.seconds(60),
  retentionPeriod: Duration.days(14),
  deadLetterQueue: {
    queue: emailDLQ,
    maxReceiveCount: 3,
  },
});
```

### Queue Inventory

| Queue | Purpose | DLQ | Consumer |
|-------|---------|-----|----------|
| `testimonials-{env}-email-queue` | Email notifications | Yes | Lambda |
| `testimonials-{env}-video-queue` | Video processing jobs | Yes | Lambda |

---

## SNS Topics

### Topic Pattern

```typescript
// CDK Pattern
const notificationTopic = new sns.Topic(stack, 'NotificationTopic', {
  topicName: `testimonials-${stage}-notifications`,
  displayName: 'Testimonials Notifications',
});
```

### Topic Inventory

| Topic | Purpose | Subscribers |
|-------|---------|-------------|
| `testimonials-{env}-uploads` | S3 upload events | Lambda processors |
| `testimonials-{env}-notifications` | System notifications | Email, Slack |

---

## DynamoDB Tables (if needed)

### Table Pattern

```typescript
// CDK Pattern
const sessionsTable = new dynamodb.Table(stack, 'SessionsTable', {
  tableName: `testimonials-${stage}-sessions`,
  partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
  sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: 'ttl',
});
```

### Potential Tables

| Table | Purpose | Access Pattern |
|-------|---------|----------------|
| `testimonials-{env}-sessions` | Session storage | pk=userId, sk=sessionId |
| `testimonials-{env}-cache` | API response cache | pk=cacheKey |

---

## CloudFront (if needed)

### Distribution Pattern

```typescript
// CDK Pattern
const distribution = new cloudfront.Distribution(stack, 'CDN', {
  defaultBehavior: {
    origin: new origins.S3Origin(assetsBucket),
    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
  },
  domainNames: [`cdn.testimonials.app`],
  certificate: certificate,
});
```

---

## EventBridge Rules

### Scheduled Tasks Pattern

```typescript
// CDK Pattern
const cleanupRule = new events.Rule(stack, 'CleanupRule', {
  ruleName: `testimonials-${stage}-daily-cleanup`,
  schedule: events.Schedule.cron({ hour: '2', minute: '0' }), // 2 AM UTC
  targets: [new targets.LambdaFunction(cleanupLambda)],
});
```

### Scheduled Tasks Inventory

| Rule | Schedule | Target | Purpose |
|------|----------|--------|---------|
| `daily-cleanup` | 2:00 AM UTC | cleanup Lambda | Remove orphaned files |
| `weekly-report` | Sunday 9:00 AM | report Lambda | Usage reports |

---

## Secrets Manager / SSM Parameter Store

### Secret Naming Pattern

```
/testimonials/{env}/{service}/{key}
```

Examples:
- `/testimonials/prod/database/connection-string`
- `/testimonials/dev/openai/api-key`
- `/testimonials/prod/supabase/jwt-secret`

### Parameter Store Usage

```typescript
// CDK - Reference SSM parameter
const dbConnectionString = ssm.StringParameter.fromStringParameterName(
  stack,
  'DbConnectionString',
  `/testimonials/${stage}/database/connection-string`
);

// Lambda - Read at runtime
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const param = await ssm.send(new GetParameterCommand({
  Name: `/testimonials/${process.env.STAGE}/openai/api-key`,
  WithDecryption: true,
}));
```

### Secrets Inventory

| Parameter Path | Purpose | Type |
|----------------|---------|------|
| `/testimonials/{env}/openai/api-key` | OpenAI API key | SecureString |
| `/testimonials/{env}/supabase/service-role-key` | Supabase admin key | SecureString |
| `/testimonials/{env}/hasura/admin-secret` | Hasura admin secret | SecureString |

---

## IAM Patterns

### Lambda Execution Role Pattern

```typescript
// CDK Pattern
const lambdaRole = new iam.Role(stack, 'LambdaRole', {
  assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    iam.ManagedPolicy.fromAwsManagedPolicyArn(
      'service-role/AWSLambdaBasicExecutionRole'
    ),
  ],
});

// Add specific permissions
lambdaRole.addToPolicy(new iam.PolicyStatement({
  actions: ['s3:GetObject', 's3:PutObject'],
  resources: [`${uploadsBucket.bucketArn}/*`],
}));
```

### Permission Principles

1. **Least Privilege**: Only grant required permissions
2. **Resource-Specific**: Always specify resource ARNs, avoid `*`
3. **Service-Linked**: Use AWS managed policies where appropriate
4. **No Cross-Account**: Permissions stay within account boundaries

---

## Monitoring & Logging

### CloudWatch Log Groups

```
/aws/lambda/testimonials-{env}-{function}
```

### Log Retention

| Environment | Retention |
|-------------|-----------|
| Production | 30 days |
| Development | 7 days |

### Alarms Pattern

```typescript
// CDK Pattern
new cloudwatch.Alarm(stack, 'ErrorAlarm', {
  alarmName: `testimonials-${stage}-lambda-errors`,
  metric: lambdaFunction.metricErrors(),
  threshold: 5,
  evaluationPeriods: 1,
  alarmDescription: 'Lambda function errors exceeded threshold',
});
```

---

## Quick Reference

### Common AWS CLI Commands

```bash
# List S3 buckets
aws s3 ls --profile testimonials-prod

# View Lambda logs
aws logs tail /aws/lambda/testimonials-prod-image-processor --follow --profile testimonials-prod

# Invoke Lambda manually
aws lambda invoke --function-name testimonials-dev-image-processor \
  --payload '{"test": true}' output.json --profile testimonials-nonprod

# List SSM parameters
aws ssm get-parameters-by-path --path /testimonials/prod --profile testimonials-prod

# View SQS queue attributes
aws sqs get-queue-attributes --queue-url <url> --attribute-names All --profile testimonials-prod
```

### Environment Variables for Lambda

| Variable | Description | Example |
|----------|-------------|---------|
| `STAGE` | Environment stage | `prod`, `dev` |
| `BUCKET_NAME` | S3 bucket name | `testimonials-prod-uploads` |
| `REGION` | AWS region | `ap-south-1` |
| `LOG_LEVEL` | Logging level | `info`, `debug` |
