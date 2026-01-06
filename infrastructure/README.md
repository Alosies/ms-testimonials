# Testimonials Infrastructure

AWS infrastructure for Testimonials using CDK with functional programming patterns.

## Structure

```
infrastructure/
├── bin/
│   └── app.ts                    # CDK app entry point
├── config/
│   ├── stages.ts                 # Stage configurations (dev/prod)
│   └── index.ts
├── constructs/
│   ├── lambda.ts                 # Lambda utilities
│   ├── s3.ts                     # S3 utilities
│   └── index.ts
├── stacks/
│   ├── storage-stack.ts          # S3 buckets
│   └── index.ts
├── lambdas/                      # Lambda function code
├── cdk.json                      # CDK configuration
├── package.json                  # CDK dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Bootstrap CDK (first time only, per account)
pnpm bootstrap:dev
pnpm bootstrap:qa
pnpm bootstrap:prod

# Deploy to dev
pnpm diff:dev    # Preview
pnpm deploy:dev  # Deploy
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Compile TypeScript |
| `pnpm synth:dev` | Synthesize CloudFormation for dev |
| `pnpm synth:qa` | Synthesize CloudFormation for qa |
| `pnpm synth:prod` | Synthesize CloudFormation for prod |
| `pnpm diff:dev` | Preview changes for dev |
| `pnpm diff:qa` | Preview changes for qa |
| `pnpm diff:prod` | Preview changes for prod |
| `pnpm deploy:dev` | Deploy to dev (auto-approve) |
| `pnpm deploy:qa` | Deploy to qa (auto-approve) |
| `pnpm deploy:prod` | Deploy to prod (requires approval) |
| `pnpm destroy:dev` | Destroy dev stacks |
| `pnpm destroy:qa` | Destroy qa stacks |
| `pnpm destroy:prod` | Destroy prod stacks |
| `pnpm bootstrap:dev` | Bootstrap CDK for Dev account |
| `pnpm bootstrap:qa` | Bootstrap CDK for QA account |
| `pnpm bootstrap:prod` | Bootstrap CDK for Prod account |

## Environments

| Environment | Account ID | Profile | Region |
|-------------|------------|---------|--------|
| Dev | `378257622586` | `testimonials-dev` | `ap-south-1` |
| QA | `745791801068` | `testimonials-qa` | `ap-south-1` |
| Prod | `405062306867` | `testimonials-prod` | `ap-south-1` |

Each environment has its own dedicated AWS account for complete isolation.

## Architecture Principles

### Functional Programming
- **No classes**: All constructs are pure functions
- **Composition over inheritance**: Combine small functions
- **Explicit dependencies**: All dependencies passed as arguments

### Separation of Concerns
- **config/**: Environment-specific settings
- **constructs/**: Reusable infrastructure utilities
- **stacks/**: Business logic infrastructure
- **lambdas/**: Lambda function code

## Adding New Lambdas

1. Create directory: `mkdir -p lambdas/my-function`
2. Initialize: `cd lambdas/my-function && pnpm init`
3. Write code in `index.ts`
4. Add to stack using `createLambda()` from constructs

## Documentation

See `/docs/infrastructure/` for detailed documentation:
- [AWS Overview](../docs/infrastructure/aws-overview.md)
- [Service Patterns](../docs/infrastructure/service-patterns.md)
- [Deployment Guide](../docs/infrastructure/deployment-guide.md)
