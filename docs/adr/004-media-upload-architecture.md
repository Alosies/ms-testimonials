# ADR-004: Media Upload Architecture

## Doc Connections
**ID**: `adr-004-media-upload`

2025-01-05-1530 IST

**Parent ReadMes**:
- `adr-index` - Architecture Decision Records index

**Related ReadMes**:
- `table-organizations` - Organizations table (logo_url field)
- `table-testimonials` - Testimonials table (customer_avatar_url field)
- `db-layer-2-multitenancy` - Multi-tenancy layer design
- `infra-aws-overview` - AWS account structure and access patterns
- `infra-service-patterns` - S3 bucket and Lambda naming conventions
- `infra-deployment-guide` - CDK deployment workflow

---

## Status

**Proposed** - 2025-01-05

## Context

Testimonials requires file upload capabilities for:
- Organization logos
- Customer avatars
- Video testimonials (future)
- Form attachments (future)

### The Problem

The application currently stores media as URL references (TEXT fields like `logo_url`, `customer_avatar_url`) but has no infrastructure for:
1. Accepting file uploads from users
2. Storing files securely
3. Serving optimized images with transformations
4. Managing media lifecycle (cleanup, quotas)

### Requirements

1. **Provider-Agnostic Design**: Ability to switch storage (AWS S3 → GCS) or CDN (ImageKit → Cloudinary) with minimal code changes
2. **Portability**: Store raw storage paths in database so files can be migrated between providers
3. **Multi-Tenancy**: Organization-isolated storage paths
4. **Performance**: Direct browser-to-S3 uploads (no server bottleneck)
5. **Security**: Validation before and after upload
6. **Cost Efficiency**: Use CDN transformations instead of storing multiple sizes

### Reference Implementation

CoursePads uses a similar pattern for video uploads:
- Presigned URL generation via API
- Direct S3 upload from browser
- Lambda validation on S3 trigger
- Webhook callback to record in database
- VdoCipher for video processing

### Existing Infrastructure

AWS CDK infrastructure is already scaffolded at `infrastructure/`:

**AWS Accounts** (per-environment isolation):
| Environment | Account ID | Bucket Name |
|-------------|------------|-------------|
| Dev | 378257622586 | `testimonials-dev-uploads` |
| QA | 745791801068 | `testimonials-qa-uploads` |
| Prod | 405062306867 | `testimonials-prod-uploads` |

**Existing CDK Constructs**:
- `infrastructure/constructs/s3.ts` - S3 bucket creation with CORS, encryption, lifecycle
- `infrastructure/constructs/lambda.ts` - Lambda with Node.js 20.x, ARM64, X-Ray tracing
- `infrastructure/stacks/storage-stack.ts` - Storage stack deploying uploads bucket
- `infrastructure/config/stages.ts` - Stage-specific configuration

**S3 Bucket Configuration** (from existing construct):
- Encryption: S3-managed
- Public access: Blocked
- CORS: Configured for frontend origins
- Lifecycle: Delete incomplete multipart uploads after 7 days
- Removal policy: RETAIN for prod, DESTROY for non-prod

## Decision

Implement a **Presigned URL upload flow with Lambda validation** and a **centralized media table** for tracking all uploads.

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Browser   │────▶│  Hono API    │────▶│    AWS S3   │────▶│    Lambda    │
│  (Vue App)  │     │ (Presigned)  │     │  (Storage)  │     │ (Validator)  │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
       │                                                             │
       │                    ┌────────────────────────────────────────┘
       │                    ▼
       │             ┌──────────────┐     ┌──────────────┐
       │             │   Webhook    │────▶│   Database   │
       │             │  (Callback)  │     │ (media tbl)  │
       │             └──────────────┘     └──────────────┘
       │                                         │
       │                                         ▼
       └────────────── Display ◀──────── ┌──────────────┐
                                         │   ImageKit   │
                                         │   (CDN)      │
                                         └──────────────┘
```

### Upload Flow

1. **Frontend requests presigned URL**: `POST /api/media/presign`
   - API validates user permissions, file type, size limits
   - API generates unique `mediaId` (format: `med_${nanoid(12)}`)
   - API builds S3 path embedding the mediaId: `{org}/{type}/{date}/{mediaId}_{timestamp}.{ext}`
   - **API creates `media` record with `status: pending`** (record exists before upload)
   - API returns: `{ mediaId, uploadUrl, storagePath, expiresAt }`

2. **Browser uploads directly to S3**: Using presigned URL
   - No file data passes through API server
   - Progress tracking via XHR/fetch
   - S3 object key contains the mediaId for correlation

3. **S3 triggers Lambda**: On `ObjectCreated` event
   - Lambda validates file content (MIME from magic bytes)
   - Lambda checks file size and path pattern
   - **Lambda parses mediaId from S3 key** via `pathBuilder.parsePath(key)`
   - Lambda extracts dimensions for images
   - Lambda calls webhook with mediaId and metadata

4. **Webhook updates database**: `POST /api/webhooks/s3-media-upload`
   - **Updates EXISTING `media` record by primary key** (mediaId from path)
   - Sets `status: ready`, populates `width`, `height`, `processing_metadata`
   - On failure: sets `status: failed` with `error_message`

5. **Frontend displays via CDN**: ImageKit URL with transforms
   - Real-time resizing, format conversion
   - No pre-generated thumbnails needed

### Media ID Correlation

The `mediaId` embedded in the S3 path is the key to correlating presign requests with webhook callbacks:

| Step | Action | mediaId Usage |
|------|--------|---------------|
| Presign | Generate `med_abc123` | Insert `media` record with this ID |
| S3 Path | `org/type/date/med_abc123_T.ext` | Embed in path |
| Lambda | Parse path | Extract `med_abc123` |
| Webhook | `update_media_by_pk(id: "med_abc123")` | Update by PK |

### S3 Bucket Path Design

**Pattern**:
```
{organization_id}/{entity_type}/{year}/{month}/{day}/{nanoid}_{timestamp}.{ext}
```

**Examples**:
```
org_abc123/organization_logo/2025/01/05/med_xyz789_20250105T143022.png
org_abc123/testimonial_video/2025/01/05/med_def456_20250105T150000.mp4
org_abc123/contact_avatar/2025/01/05/med_ghi012_20250105T160000.jpg
```

**Design Rationale**:
- **Organization ID first**: Enables bucket policies per org, easy data export/deletion
- **Entity type second**: Allows different storage classes (e.g., videos in cheaper tier)
- **Date partitioning**: Optimizes S3 LIST operations, enables lifecycle policies
- **Unique ID + timestamp**: Prevents collisions, aids debugging
- **No PII in paths**: No emails or names, just IDs

### Media Entity Types Lookup Table

```sql
-- Lookup table defining valid entity types and their validation rules
CREATE TABLE public.media_entity_types (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),  -- Opaque ID (project convention)
  code TEXT NOT NULL UNIQUE,                          -- Semantic identifier, FK target
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_column TEXT NOT NULL DEFAULT 'id',
  allowed_mime_types TEXT[] NOT NULL,
  max_file_size_bytes BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT REFERENCES public.users(id),       -- User who created this type (nullable for seed data)
  updated_by TEXT REFERENCES public.users(id)        -- User who last modified this type
);

COMMENT ON TABLE public.media_entity_types IS
  'Lookup table defining valid media entity types with validation rules.
   Each type specifies which table it relates to and file constraints.';

COMMENT ON COLUMN public.media_entity_types.code IS
  'Semantic code for the entity type (e.g., organization_logo). FK target for media.entity_type.';

COMMENT ON COLUMN public.media_entity_types.target_table IS
  'The database table that entity_id references (e.g., organizations, contacts)';

COMMENT ON COLUMN public.media_entity_types.allowed_mime_types IS
  'Array of MIME types allowed for this entity type';

-- Seed data
INSERT INTO public.media_entity_types
  (code, display_name, description, target_table, allowed_mime_types, max_file_size_bytes)
VALUES
  ('organization_logo', 'Organization Logo',
   'Logo image displayed in dashboard and public forms',
   'organizations',
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
   5242880),  -- 5MB

  ('contact_avatar', 'Contact Avatar',
   'Profile photo for a contact/customer',
   'contacts',
   ARRAY['image/jpeg', 'image/png', 'image/webp'],
   2097152),  -- 2MB

  ('testimonial_video', 'Testimonial Video',
   'Video testimonial recording from customer',
   'testimonials',
   ARRAY['video/mp4', 'video/quicktime', 'video/webm'],
   524288000),  -- 500MB

  ('form_attachment', 'Form Attachment',
   'File uploaded by customer via public form submission',
   'form_submissions',
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/quicktime', 'video/webm'],
   10485760);  -- 10MB
```

### Media Table Schema

```sql
CREATE TABLE public.media (
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- File metadata
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,

  -- Storage (provider-agnostic)
  storage_provider TEXT NOT NULL DEFAULT 'aws_s3',
  storage_bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_region TEXT,

  -- Usage context (references lookup table by code)
  entity_type TEXT NOT NULL REFERENCES public.media_entity_types(code),
  entity_id TEXT,

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'uploading', 'processing', 'ready', 'failed', 'deleted')),
  error_message TEXT,
  processing_metadata JSONB DEFAULT '{}',

  -- Media dimensions (see "Metadata Extraction" section for population strategy)
  width INTEGER,
  height INTEGER,
  duration_seconds DECIMAL(10, 2),  -- Video only
  thumbnail_path TEXT,              -- Video only, auto-generated thumbnail

  -- Audit
  uploaded_by TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.media.storage_path IS
  'Full object path within bucket - the portable key for provider migration.
   Pattern: {org_id}/{entity_type}/{YYYY}/{MM}/{DD}/{media_id}_{timestamp}.{ext}';

COMMENT ON COLUMN public.media.entity_type IS
  'References media_entity_types lookup table. Determines validation rules and target table.';

COMMENT ON COLUMN public.media.entity_id IS
  'Foreign key to the entity specified by entity_type.
   NULL for pending uploads not yet linked to an entity.';
```

### CDN Configuration (Frontend Only)

CDN URL generation is a **frontend responsibility**. The API stores only the `storage_path` - the frontend uses ImageKit's Vue SDK to generate transformed URLs.

```bash
# Frontend (.env) - CDN configuration lives here
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
VITE_IMAGEKIT_PUBLIC_KEY=public_xxxx  # Optional, for uploads only
```

**Why Frontend CDN URL Generation?**
1. **Lightweight** - URL construction is simple string building, no server needed
2. **Responsive images** - Frontend knows device size, can request optimal dimensions
3. **Reduced backend load** - API doesn't need to generate URLs for every image
4. **Dynamic** - Transforms can change based on UI context without API calls
5. **SDK support** - ImageKit provides Vue SDK with `<IKImage>` component and `buildSrc()` utility

**Rationale**: CDN configuration is deployment-specific, not per-file. The `storage_path` is the portable key - changing CDNs only requires updating frontend environment variables.

### Key Fields for Portability

- `storage_provider`: `aws_s3`, `gcs`, `azure_blob`
- `storage_bucket`: Bucket name
- `storage_path`: Full object path (the migration key)

**To migrate to a new storage provider:**
1. Copy files maintaining `storage_path` structure
2. Update `storage_provider` and `storage_bucket` columns
3. Update storage adapter configuration

**To migrate to a new CDN:**
1. Configure new CDN to use same S3 bucket as origin
2. Update `VITE_CDN_BASE_URL` environment variable
3. No database changes needed

### Metadata Extraction (Images)

**Lambda is the source of truth** for image dimensions. Client-side extraction is optional (for UX preview only).

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser    │───▶│   Hono API   │───▶│    Lambda    │───▶│   Webhook    │
│              │    │              │    │              │    │              │
│ 1. Select    │    │ 2. Create    │    │ 3. Validate  │    │ 4. Update    │
│    file      │    │    pending   │    │    file type │    │    record    │
│ 2. Upload    │    │    record    │    │ 4. Extract   │    │    with dims │
│    to S3     │    │  (dims=NULL) │    │    dimensions│    │    status=   │
│              │    │              │    │ 5. Call hook │    │    ready     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

**Why Lambda extracts dimensions:**
- Single source of truth (no client spoofing)
- Verified from actual file content
- Client extraction optional (only for instant preview/validation UX)

**Lambda extracts using `image-size`:**
```typescript
import imageSize from 'image-size';

// Reads image headers only - fast, no full decode
const dimensions = imageSize(buffer);
// { width: 800, height: 600, type: 'png' }
```

**Webhook payload includes dimensions:**
```json
{
  "event": "upload_complete",
  "record": {
    "bucket": "testimonials-prod-uploads",
    "key": "org_abc/organization_logo/2025/01/05/med_xyz.png",
    "size": 245678,
    "contentType": "image/png",
    "width": 800,
    "height": 600
  }
}
```

**Presign request (no dimensions needed):**
```json
{
  "filename": "logo.png",
  "mimeType": "image/png",
  "fileSizeBytes": 245678,
  "entityType": "organization_logo"
}
```

> **Future Extension (Videos):** The schema includes `duration_seconds` and `thumbnail_path` fields for future video support. Video metadata extraction requires a different architecture (async processing queue + ffprobe) and will be designed separately when video testimonials are implemented.

### API Storage Adapter Pattern

The API handles storage operations only. CDN URL generation is handled by the frontend.

```
api/src/shared/libs/media/
├── adapters/
│   └── s3.adapter.ts         # AWS S3 storage implementation
├── core/
│   ├── MediaService.ts       # Storage orchestrator (no CDN)
│   ├── validators.ts         # Upload validation
│   └── pathBuilder.ts        # S3 path generation
├── types.ts                  # Storage types only
└── index.ts
```

**Storage Adapter Interface** (API):
```typescript
interface StorageAdapter {
  generatePresignedUploadUrl(params: PresignParams): Promise<PresignedUrl>;
  generatePresignedDownloadUrl(bucket: string, key: string, expiresIn?: number): Promise<string>;
  deleteObject(bucket: string, key: string): Promise<void>;
  getObjectMetadata(bucket: string, key: string): Promise<ObjectMetadata>;
  objectExists(bucket: string, key: string): Promise<boolean>;
}
```

### Frontend CDN Integration

The frontend uses ImageKit's Vue SDK for URL generation with transforms:

```
apps/web/src/entities/media/
├── adapters/
│   └── imagekit.ts           # buildMediaUrl() using @imagekit/javascript
├── composables/
│   └── useMediaUrl.ts        # Composable wrapping ImageKit SDK
└── components/
    └── IKImage.vue           # Wrapper around ImageKit's Image component
```

**Frontend URL Generation** (using ImageKit SDK):
```typescript
import { buildSrc } from '@imagekit/javascript';

// Generate transformed URL from storage_path
const imageUrl = buildSrc({
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  src: media.storagePath,  // From GraphQL
  transformation: [{ width: 200, height: 200, focus: 'auto' }]
});
```

### Lambda Function

**Name**: `testimonials-{stage}-media-validator`
**Code Location**: `infrastructure/lambdas/media-validator/`

**Trigger**: S3 ObjectCreated on `testimonials-{stage}-uploads` bucket

**Responsibilities**:
1. Validate path matches expected pattern
2. Check file size within limits
3. Verify MIME type from file content (not headers)
4. Call webhook API with HMAC signature
5. Delete invalid files

**Allowed Types**:
```javascript
const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  videos: ['video/mp4', 'video/quicktime', 'video/webm']
};

const MAX_SIZES = {
  images: 10 * 1024 * 1024,      // 10MB
  videos: 500 * 1024 * 1024      // 500MB
};
```

### ImageKit Integration

**Configuration**:
- Origin: AWS S3 bucket
- URL Endpoint: `https://ik.imagekit.io/{imagekit_id}`
- Path prefix: `/testimonials`

**URL Pattern**:
```
https://ik.imagekit.io/{id}/testimonials/{storage_path}?tr={transforms}
```

**Transform Examples**:
```
# Logo (max 200px width, auto format)
tr=w-200,c-at_max,f-auto

# Avatar (100x100, face detection, auto format)
tr=w-100,h-100,c-maintain_ratio,fo-face,f-auto

# Thumbnail (300x200, cover crop, WebP)
tr=w-300,h-200,c-maintain_ratio,fo-auto,f-webp
```

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/media/presign` | Generate presigned upload URL |
| POST | `/api/webhooks/s3-media-upload` | Lambda callback (HMAC protected) |
| GET | `/api/media/:id` | Get media metadata |
| DELETE | `/api/media/:id` | Delete media (soft delete + schedule S3 cleanup) |

### Frontend Components

```
apps/web/src/entities/media/
├── models/
│   ├── media.ts          # Media, MediaStatus types (from GraphQL)
│   └── upload.ts         # UploadProgress, UploadConfig types
├── composables/
│   ├── useUploadMedia.ts # Main upload logic (presign + S3 upload)
│   └── useMediaUrl.ts    # CDN URL generation using ImageKit SDK
├── components/
│   ├── MediaUploader.vue # Drag-drop upload component
│   └── ImagePreview.vue  # Image with transform support
└── adapters/
    └── imagekit.ts       # buildMediaUrl() wrapper for ImageKit SDK
```

**ImageKit Vue SDK Integration**:
```bash
pnpm add @imagekit/javascript  # Core SDK for URL generation
# Or use the Vue-specific SDK:
pnpm add @imagekit/vue
```

**useMediaUrl Composable Pattern**:
```typescript
// apps/web/src/entities/media/composables/useMediaUrl.ts
import { buildSrc } from '@imagekit/javascript';

export function useMediaUrl() {
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

  function getImageUrl(storagePath: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
  }) {
    return buildSrc({
      urlEndpoint,
      src: storagePath,
      transformation: [
        { width: options?.width, height: options?.height, quality: options?.quality }
      ].filter(t => Object.values(t).some(v => v !== undefined))
    });
  }

  return { getImageUrl };
}
```

## Consequences

### Positive

1. **Provider Agnostic**: Swap S3 for GCS or ImageKit for Cloudinary via adapter configuration
2. **Portable**: `storage_path` can be replicated to any provider
3. **Performant**: No server bottleneck for file data, direct S3 uploads
4. **Secure**: Double validation (API + Lambda), no unsigned uploads
5. **Cost Efficient**: Single file stored, CDN transforms on-the-fly
6. **Auditable**: All uploads tracked in `media` table with metadata
7. **Multi-tenant Safe**: Org ID in path, validated at every step

### Negative

1. **Infrastructure Complexity**: Requires Lambda, S3 triggers, webhook security
2. **Initial Setup Time**: More components than simple server upload
3. **Cost**: Lambda invocations, S3 storage, ImageKit bandwidth
4. **Debugging**: Upload flow spans multiple services

### Neutral

1. **No Pre-generated Thumbnails**: CDN handles this, but means no offline access
2. **Eventual Consistency**: Small delay between upload complete and webhook
3. **Lambda Cold Starts**: First upload after idle may be slower (~200ms)

## Alternatives Considered

### Alternative 1: Supabase Storage
**Description**: Use Supabase's built-in storage (already have Supabase for auth)

**Rejected Because**:
- Less control over bucket structure
- No native CDN transformation
- Harder to migrate away from
- Not S3-compatible for existing tools

### Alternative 2: Server Proxy Upload
**Description**: Browser → API → S3 (API handles the upload)

**Rejected Because**:
- API becomes bottleneck
- Requires streaming or large memory for big files
- More server resources needed
- Slower for users (double hop)

### Alternative 3: Client-side Validation Only
**Description**: Skip Lambda, trust presigned URL constraints

**Rejected Because**:
- Presigned URLs have limited validation (only size, content-type header)
- Malicious users could upload disguised files
- No content-based MIME verification
- Harder to reject bad uploads after the fact

### Alternative 4: No Media Table (URLs Only)
**Description**: Store URLs directly in entity tables, no central tracking

**Rejected Because**:
- No orphan cleanup possible
- No quota tracking
- No audit trail
- Harder to migrate (URLs scattered across tables)

## Implementation Phases

### Phase 1: Foundation (Database + API Storage)
- [x] Create `media_entity_types` lookup table migration
- [x] Create `media` table migration
- [x] Inline S3 storage adapter in API (`api/src/shared/libs/media/`)
- [x] Add presigned URL API endpoint (`POST /media/presign`)
- [x] Add Hasura metadata for media tables

### Phase 2: Lambda & Webhook
- [x] Create Lambda function code (`infrastructure/lambdas/media-validator/`)
- [x] Deploy Lambda with S3 trigger via CDK
- [x] Implement webhook endpoint with HMAC validation
- [ ] Test end-to-end flow

### Phase 3: Frontend (CDN Integration)
- [ ] Add ImageKit Vue SDK (`@imagekit/javascript`)
- [ ] Create `useMediaUrl` composable for CDN URL generation
- [ ] Create `useUploadMedia` composable for presign + upload flow
- [ ] Build `MediaUploader` component
- [ ] Build `ImagePreview` component with transform support
- [ ] Integrate with organization logo form

### Phase 4: Production Hardening
- [ ] Hasura permissions for media table (RLS by organization)
- [ ] Quota tracking per organization
- [ ] Orphan cleanup job (delete S3 files for failed/deleted records)
- [ ] Monitoring and alerts

## References

- CoursePads video upload: `/Users/alosiesgeorge/CodeRepositories/Fork/Coursepads/docs/prd/v1/video-management/`
- CoursePads S3 presign: `/Users/alosiesgeorge/CodeRepositories/Fork/Coursepads/api/src/features/video/presignedUrl/`
- CoursePads Lambda: `/Users/alosiesgeorge/CodeRepositories/Fork/Coursepads/infrastructure/lambdas/s3-video-filter/`
- ImageKit documentation: https://docs.imagekit.io/
- AWS S3 presigned URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
