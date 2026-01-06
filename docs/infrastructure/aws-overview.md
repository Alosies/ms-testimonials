# AWS Infrastructure Overview

## Doc Connections
**ID**: `infra-aws-overview`

2026-01-06-1200 IST

**Parent ReadMes**:
- `infra-index` - Infrastructure documentation index

**Related ReadMes**:
- `infra-service-patterns` - Service naming conventions
- `infra-deployment-guide` - CDK deployment workflow

---

This document describes the AWS account structure and access patterns for the Testimonials project.

## Account Structure

Testimonials operates within the Brownforge AWS Organization with dedicated accounts for each environment.

```
AWS Organization (George Prep - Management)
├── OU: Brownforge-Shared
│   └── Brownforge-Shared (264263332555)
│       └── Shared services: Route53, SES, cross-product resources
│
└── OU: Testimonials
    ├── Testimonials-Dev (378257622586)
    │   └── Development workloads
    ├── Testimonials-QA (745791801068)
    │   └── QA/Testing workloads
    └── Testimonials-Prod (405062306867)
        └── Production workloads
```

## Account Details

| Environment | Account ID | Account Name | Email | AWS Profile |
|-------------|------------|--------------|-------|-------------|
| Dev | `378257622586` | Testimonials-Dev | alosies+testimonials-dev@gmail.com | `testimonials-dev` |
| QA | `745791801068` | Testimonials-QA | alosies+testimonials-qa@gmail.com | `testimonials-qa` |
| Production | `405062306867` | Testimonials-Prod | alosies+testimonials-prod@gmail.com | `testimonials-prod` |
| Shared | `264263332555` | Brownforge-Shared | alosies+brownforge-shared@gmail.com | `brownforge-shared` |

Each environment has its own dedicated AWS account for complete isolation.

## AWS CLI Access

### Prerequisites

1. AWS CLI v2 installed
2. Default profile configured with management account credentials
3. Profiles configured in `~/.aws/config`

### Profile Configuration

Add these profiles to `~/.aws/config`:

```ini
# Brownforge Organization Profiles
[profile brownforge-shared]
role_arn = arn:aws:iam::264263332555:role/OrganizationAccountAccessRole
source_profile = default
region = ap-south-1
output = json

[profile testimonials-dev]
role_arn = arn:aws:iam::378257622586:role/OrganizationAccountAccessRole
source_profile = default
region = ap-south-1
output = json

[profile testimonials-qa]
role_arn = arn:aws:iam::745791801068:role/OrganizationAccountAccessRole
source_profile = default
region = ap-south-1
output = json

[profile testimonials-prod]
role_arn = arn:aws:iam::405062306867:role/OrganizationAccountAccessRole
source_profile = default
region = ap-south-1
output = json
```

### Usage

```bash
# Verify access
aws sts get-caller-identity --profile testimonials-dev
aws sts get-caller-identity --profile testimonials-qa
aws sts get-caller-identity --profile testimonials-prod

# Set profile for session
export AWS_PROFILE=testimonials-dev

# Use inline with commands
aws s3 ls --profile testimonials-prod
```

## Console Access

### Switch Role (from Management Account)

1. Sign in to AWS Console with `alosies@gmail.com`
2. Click account dropdown (top right)
3. Click **Switch role**
4. Enter:
   - **Account**: Target account ID (e.g., `405062306867`)
   - **Role**: `OrganizationAccountAccessRole`
   - **Display Name**: e.g., "Testimonials-Prod"
   - **Color**: Red for prod, Green for nonprod

### Saved Role Switches

| Display Name | Account | Role | Color |
|--------------|---------|------|-------|
| Testimonials-Dev | 378257622586 | OrganizationAccountAccessRole | Green |
| Testimonials-QA | 745791801068 | OrganizationAccountAccessRole | Yellow |
| Testimonials-Prod | 405062306867 | OrganizationAccountAccessRole | Red |
| Brownforge-Shared | 264263332555 | OrganizationAccountAccessRole | Blue |

## Environment Isolation

Each environment has its own dedicated AWS account for complete isolation.

### Dev Account (378257622586)

- **Purpose**: Active development and testing
- **Access**: Open for development
- **Resources**: Dev databases, S3 buckets, Lambda functions
- **Naming**: `testimonials-dev-*`
- **CDK Stack Suffix**: `-dev`
- **Profile**: `testimonials-dev`

### QA Account (745791801068)

- **Purpose**: Pre-production testing and validation
- **Access**: Open for QA team
- **Resources**: QA databases, S3 buckets, Lambda functions
- **Naming**: `testimonials-qa-*`
- **CDK Stack Suffix**: `-qa`
- **Profile**: `testimonials-qa`

### Production Account (405062306867)

- **Purpose**: Live customer-facing resources only
- **Access**: Restricted, changes require approval
- **Resources**: Production databases, S3 buckets, Lambda functions
- **Naming**: `testimonials-prod-*`
- **CDK Stack Suffix**: `-prod`
- **Profile**: `testimonials-prod`

### Shared Account (264263332555)

- **Purpose**: Cross-product shared resources
- **Resources**: Route53 hosted zones, SES domain identity
- **Usage**: DNS records, email sending configuration
- **Profile**: `brownforge-shared`

## Environment to Account Mapping

```
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│   Testimonials-Dev    │  │   Testimonials-QA     │  │   Testimonials-Prod   │
│    (378257622586)     │  │    (745791801068)     │  │    (405062306867)     │
│  ┌─────────────────┐  │  │  ┌─────────────────┐  │  │  ┌─────────────────┐  │
│  │      DEV        │  │  │  │       QA        │  │  │  │      PROD       │  │
│  │testimonials-dev-│  │  │  │testimonials-qa- │  │  │  │testimonials-prod│  │
│  │       *         │  │  │  │        *        │  │  │  │       -*        │  │
│  └─────────────────┘  │  │  └─────────────────┘  │  │  └─────────────────┘  │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

## Tagging Requirements

All resources MUST have these tags:

| Tag Key | Values | Purpose |
|---------|--------|---------|
| `Environment` | `prod`, `dev`, `qa` | Cost tracking, environment identification |
| `Product` | `testimonials` | Product attribution |
| `Owner` | `alosies`, `team-name` | Resource ownership |

### Tagging Example (CLI)

```bash
aws s3api put-bucket-tagging --bucket testimonials-prod-uploads \
  --tagging 'TagSet=[{Key=Environment,Value=prod},{Key=Product,Value=testimonials},{Key=Owner,Value=alosies}]' \
  --profile testimonials-prod
```

### Tagging Example (CDK)

```typescript
import { Tags } from 'aws-cdk-lib';

Tags.of(stack).add('Environment', config.stage);
Tags.of(stack).add('Product', 'testimonials');
Tags.of(stack).add('Owner', 'alosies');
```

## Region Strategy

| Resource Type | Region | Rationale |
|---------------|--------|-----------|
| Primary infrastructure | `ap-south-1` (Mumbai) | Closest to target users |
| CloudFront | Global | Edge distribution |
| Route53 | Global | DNS is global |
| S3 (uploads) | `ap-south-1` | Data locality |

## Cost Management

### Budget Alerts

Budgets are configured per account in AWS Billing:

| Account | Monthly Budget | Alert Threshold |
|---------|---------------|-----------------|
| Testimonials-Prod | $50 | 80%, 100% |
| Testimonials-NonProd | $20 | 80%, 100% |

### Cost Allocation

1. Enable cost allocation tags in Billing console
2. Use Cost Explorer to filter by `Product=testimonials`
3. View per-environment costs using `Environment` tag

## Security Guidelines

1. **Never commit credentials** - Use IAM roles and profiles
2. **Least privilege** - Lambda functions get minimal permissions
3. **No cross-account access** - Each account is isolated
4. **Secrets in SSM/Secrets Manager** - Never in code or environment variables in plaintext

## Related Documentation

- [Deployment Guide](./deployment-guide.md) - How to deploy infrastructure
- [Service Patterns](./service-patterns.md) - Patterns for AWS services
- [Brownforge AWS Management](/Users/alosiesgeorge/CodeRepositories/Fork/micro-saas/brownforge/docs/aws-account-management.md) - Organization-level documentation
