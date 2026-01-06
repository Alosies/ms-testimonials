# Infrastructure Documentation

## Doc Connections
**ID**: `infra-index`

2026-01-06-1200 IST

**Parent ReadMes**:
- `docs-index` - Documentation root index

**Related ReadMes**:
- `infra-aws-overview` - AWS account structure
- `infra-service-patterns` - Service naming conventions
- `infra-deployment-guide` - CDK deployment workflow

---

AWS infrastructure documentation for the Testimonials project.

## Documents

| Document | Description |
|----------|-------------|
| [AWS Overview](./aws-overview.md) | Account structure, access patterns, CLI profiles |
| [Service Patterns](./service-patterns.md) | Naming conventions, S3, Lambda, SQS patterns |
| [Deployment Guide](./deployment-guide.md) | CDK setup, deployment workflow, troubleshooting |

## Quick Reference

### AWS Accounts

| Environment | Account ID | CLI Profile |
|-------------|------------|-------------|
| Dev | `378257622586` | `testimonials-dev` |
| QA | `745791801068` | `testimonials-qa` |
| Production | `405062306867` | `testimonials-prod` |
| Shared | `264263332555` | `brownforge-shared` |

### Deployment Commands

```bash
cd infrastructure

# Deploy to each environment
pnpm deploy:dev      # → Dev account (auto-approve)
pnpm deploy:qa       # → QA account (auto-approve)
pnpm deploy:prod     # → Prod account (requires approval)

# Preview changes
pnpm diff:dev
pnpm diff:qa
pnpm diff:prod
```

### Verify Access

```bash
aws sts get-caller-identity --profile testimonials-dev   # dev
aws sts get-caller-identity --profile testimonials-qa    # qa
aws sts get-caller-identity --profile testimonials-prod  # prod
```

### Naming Pattern

```
testimonials-{env}-{service}-{purpose}
```

Examples:
- `testimonials-prod-uploads` (S3 bucket)
- `testimonials-dev-image-processor` (Lambda)
- `/testimonials/prod/openai/api-key` (SSM parameter)

## Infrastructure Code

The `infrastructure/` directory at the project root contains the AWS CDK code:

```
infrastructure/
├── bin/app.ts           # CDK entry point
├── config/stages.ts     # Environment configs
├── constructs/          # Reusable utilities
├── stacks/              # Infrastructure stacks
└── lambdas/             # Lambda function code
```

## Related

- [Brownforge AWS Management](../../../brownforge/docs/aws-account-management.md) - Organization-level docs
