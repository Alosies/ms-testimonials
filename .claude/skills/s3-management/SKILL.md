---
name: s3-management
description: Manage AWS S3 resources for media uploads. Use for listing, uploading, deleting S3 objects, checking bucket configuration, or troubleshooting access issues. Triggers on "s3", "bucket", "upload", "media storage".
allowed-tools: Bash, Read
---

# S3 Management Skill

Manage AWS S3 resources for the Testimonials platform using the AWS CLI.

## Source of Truth

**Configuration is defined in:** `infrastructure/config/stages.ts`

Before running any S3 commands, read this file to get the correct:
- Bucket name (`bucketName`)
- Region (`region`)
- AWS Profile (`profile`)

```bash
# Always read config first
cat infrastructure/config/stages.ts | grep -A5 "dev:"
```

## Quick Reference

```bash
# Get config for current stage (replace STAGE with dev/qa/prod)
STAGE=dev
BUCKET=$(grep -A10 "${STAGE}:" infrastructure/config/stages.ts | grep bucketName | cut -d"'" -f2)
PROFILE=$(grep -A10 "${STAGE}:" infrastructure/config/stages.ts | grep profile | cut -d"'" -f2)
REGION=$(grep -A10 "${STAGE}:" infrastructure/config/stages.ts | grep region | cut -d"'" -f2)

# List bucket contents
aws s3 ls s3://${BUCKET} --profile ${PROFILE} --recursive

# Check bucket exists
aws s3api head-bucket --bucket ${BUCKET} --profile ${PROFILE}
```

## Common Operations

### Validate Access

```bash
# Check current identity
aws sts get-caller-identity --profile ${PROFILE}

# Verify bucket access
aws s3api head-bucket --bucket ${BUCKET} --profile ${PROFILE} && echo "✓ Bucket accessible"
```

### List Objects

```bash
# List all objects
aws s3 ls s3://${BUCKET} --profile ${PROFILE} --recursive

# List with human-readable sizes
aws s3 ls s3://${BUCKET} --profile ${PROFILE} --recursive --human-readable

# Count objects
aws s3 ls s3://${BUCKET} --profile ${PROFILE} --recursive | wc -l

# List by entity type
aws s3 ls s3://${BUCKET}/org_*/organization_logo/ --profile ${PROFILE}
```

### Object Operations

```bash
# Get object metadata
aws s3api head-object --bucket ${BUCKET} --key path/to/file.png --profile ${PROFILE}

# Delete object
aws s3 rm s3://${BUCKET}/path/to/file.png --profile ${PROFILE}

# Delete with dry-run first
aws s3 rm s3://${BUCKET}/test/ --profile ${PROFILE} --recursive --dryrun
```

### Presigned URLs

```bash
# Generate presigned download URL (1 hour)
aws s3 presign s3://${BUCKET}/path/to/file.png --profile ${PROFILE} --expires-in 3600
```

### Bucket Configuration

```bash
# Get CORS config
aws s3api get-bucket-cors --bucket ${BUCKET} --profile ${PROFILE}

# Get lifecycle rules
aws s3api get-bucket-lifecycle-configuration --bucket ${BUCKET} --profile ${PROFILE}
```

## Path Structure

Defined in `packages/libs/media-service/src/core/pathBuilder.ts`:

```
{org_id}/{entity_type}/{year}/{month}/{day}/{media_id}_{timestamp}.{ext}
```

Entity types (from `db/hasura/migrations/.../media_entity_types/up.sql`):
- `organization_logo`
- `contact_avatar`
- `testimonial_video`
- `form_attachment`

## Troubleshooting

### Access Denied
1. Verify profile exists: `aws configure list-profiles`
2. Check identity: `aws sts get-caller-identity --profile ${PROFILE}`
3. Verify account matches bucket owner in `infrastructure/config/stages.ts`

### Credential Issues
```bash
# View profile config
aws configure list --profile ${PROFILE}

# List all buckets to test access
aws s3 ls --profile ${PROFILE}
```
