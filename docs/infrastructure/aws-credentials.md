# AWS Credentials Setup

## Doc Connections
**ID**: `infra-aws-credentials`

2026-01-06-2030 IST

**Parent ReadMes**:
- `infra-index` - Infrastructure documentation index

**Related ReadMes**:
- `infra-aws-overview` - AWS account structure
- `infra-deployment-guide` - CDK deployment workflow

---

This document describes how to configure AWS credentials for local development and deployed services.

## Credential Strategy

We use two types of IAM users per account:

| User Type | Purpose | Permissions | Used By |
|-----------|---------|-------------|---------|
| `*-admin` | Local development, CDK deployments | `AdministratorAccess` | Developers' machines |
| `*-api` | API services, Lambda execution | `AmazonS3FullAccess`, `AWSLambda_FullAccess` | API server, deployed services |

This separation follows the principle of least privilege - services only get the permissions they need.

## Dev Account Users (378257622586)

### testimonials-dev-admin

- **Purpose**: Local development on Mac, CDK deployments, full AWS console access via CLI
- **Policy**: `AdministratorAccess`
- **Access Key ID**: `AKIAVQEPJIY5JCKRAV4F`
- **Use in**: `~/.aws/credentials` as `[testimonials-dev]` profile

### testimonials-dev-api

- **Purpose**: API server S3 operations, Lambda execution
- **Policies**: `AmazonS3FullAccess`, `AWSLambda_FullAccess`
- **Access Key ID**: `AKIAVQEPJIY5PH63KDZ2`
- **Use in**: `api/.env` for local API development

## Local Setup

### 1. AWS Credentials File

Add the admin profile to `~/.aws/credentials`:

```ini
[testimonials-dev]
aws_access_key_id = AKIAVQEPJIY5JCKRAV4F
aws_secret_access_key = <secret from 1Password or secure storage>
region = ap-south-1
```

### 2. API Environment File

Copy `api/.env.example` to `api/.env` and set:

```bash
# AWS (Testimonials-Dev Account)
AWS_REGION=ap-south-1
S3_MEDIA_BUCKET=testimonials-dev-uploads
AWS_PROFILE=testimonials-dev
AWS_ACCESS_KEY_ID=AKIAVQEPJIY5PH63KDZ2
AWS_SECRET_ACCESS_KEY=<secret from 1Password or secure storage>

# Lambda webhook secret (for media upload callbacks)
AWS_LAMBDA_MEDIA_WEBHOOK_SECRET=<generate with: openssl rand -hex 32>
```

### 3. Verify Access

```bash
# Test admin profile (for CDK deployments)
aws sts get-caller-identity --profile testimonials-dev

# Expected output:
# {
#     "UserId": "AIDAVQEPJIY5...",
#     "Account": "378257622586",
#     "Arn": "arn:aws:iam::378257622586:user/testimonials-dev-admin"
# }

# Test S3 access
aws s3 ls s3://testimonials-dev-uploads --profile testimonials-dev
```

## Credential Rotation

Access keys should be rotated regularly:

1. Create new access key in AWS Console (IAM > Users > Security credentials)
2. Update local credentials
3. Test access
4. Deactivate old key
5. Delete old key after confirming new key works

## Secrets Storage

**Never commit secrets to git.** Store them in:

- **1Password**: Team secrets vault (recommended)
- **AWS Secrets Manager**: For production services
- **SSM Parameter Store**: For Lambda environment variables

## Environment-Specific Credentials

| Environment | Admin User | API User | Profile |
|-------------|------------|----------|---------|
| Dev | `testimonials-dev-admin` | `testimonials-dev-api` | `testimonials-dev` |
| QA | `testimonials-qa-admin` | `testimonials-qa-api` | `testimonials-qa` |
| Prod | `testimonials-prod-admin` | `testimonials-prod-api` | `testimonials-prod` |

Note: QA and Prod users need to be created following the same pattern as Dev.

## Troubleshooting

### "Unable to locate credentials"

```bash
# Check current identity
aws sts get-caller-identity --profile testimonials-dev

# Check credentials file exists
cat ~/.aws/credentials | grep testimonials
```

### "Access Denied"

```bash
# Verify the correct account
aws sts get-caller-identity --profile testimonials-dev

# Check if bucket exists in correct account
aws s3api head-bucket --bucket testimonials-dev-uploads --profile testimonials-dev
```

### "ExpiredToken"

This happens with role assumption. Our admin users use long-term credentials, so this shouldn't occur. If it does, regenerate access keys in IAM console.

## Related

- [AWS Overview](./aws-overview.md) - Account structure
- [Deployment Guide](./deployment-guide.md) - CDK deployment workflow
- [S3 Management Skill](/.claude/skills/s3-management/SKILL.md) - Claude skill for S3 operations
