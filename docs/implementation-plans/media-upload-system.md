# Implementation Plan: Media Upload System

> Provider-agnostic image upload with AWS S3 storage and ImageKit CDN transformations.

**ADR:** `docs/adr/004-media-upload-architecture.md`
**Status:** In Progress
**Created:** January 5, 2026
**Updated:** January 7, 2026
**Scope:** Images only (architecture extensible for future video support)

---

## Architectural Update (2026-01-07)

**Key Change:** CDN URL generation moved to **frontend only**.

### Previous Approach (Superseded)
- Shared `@testimonials/media-service` package with both S3 and ImageKit adapters
- API imported package for presign + CDN URL generation

### Current Approach
- **API**: Storage operations inlined in `api/src/shared/libs/media/` (S3 adapter, validators, path builder)
- **Frontend**: ImageKit Vue SDK (`@imagekit/javascript`) for CDN URL generation
- **Database**: Stores only `storage_path` - frontend builds CDN URLs dynamically

### Rationale
1. ImageKit recommends client-side URL generation for SPAs
2. Reduces API complexity and backend load
3. Enables responsive images based on device context
4. No workspace package dependency issues during deployment

See ADR-004 for full rationale.

---

## Overview

Implement a modular image upload system using presigned URLs for direct browser-to-S3 uploads, Lambda validation with dimension extraction, and ImageKit for CDN transformations. The architecture is designed for provider portability and future video extension.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UPLOAD FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    1. Request     ┌──────────┐    2. Generate    ┌────────┐ │
│   │  Browser │ ──────────────▶   │  Hono    │ ───────────────▶  │  S3    │ │
│   │  (Vue)   │    Presign        │  API     │    Presigned URL  │ Client │ │
│   └──────────┘                   └──────────┘                   └────────┘ │
│        │                              │                              │      │
│        │                              │                              │      │
│        │ 3. Direct Upload             │                              ▼      │
│        │    (Presigned URL)           │                        ┌─────────┐  │
│        └──────────────────────────────┼───────────────────────▶│  AWS    │  │
│                                       │                        │  S3     │  │
│                                       │                        │ Bucket  │  │
│                                       │                        └─────────┘  │
│                                       │                              │      │
│                                       │                              │      │
│                                       │    4. S3 Event              ▼      │
│                                       │       Trigger         ┌─────────┐  │
│                                       │  ◀────────────────────│ Lambda  │  │
│                                       │                       │Validator│  │
│                                       │                        └─────────┘  │
│                                       │                              │      │
│        ┌──────────────────────────────┘                              │      │
│        │                                                             │      │
│        ▼                                                             │      │
│   ┌──────────┐    5. Webhook         ┌──────────┐                   │      │
│   │  Hono    │ ◀─────────────────────│  Lambda  │ ◀─────────────────┘      │
│   │  API     │    (HMAC Signed)      │          │   Validate + Callback    │
│   └──────────┘                       └──────────┘                          │
│        │                                                                    │
│        │ 6. Insert Record                                                   │
│        ▼                                                                    │
│   ┌──────────┐                                                             │
│   │ Hasura   │                                                             │
│   │   DB     │                                                             │
│   │ (media)  │                                                             │
│   └──────────┘                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DISPLAY FLOW (Frontend CDN)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────┐    1. Query       ┌──────────┐    2. Get         ┌────────┐ │
│   │  Browser │ ──────────────▶   │  Hasura  │ ──────────────▶   │ Media  │ │
│   │  (Vue)   │    Media          │  GraphQL │    storagePath    │ Table  │ │
│   └──────────┘                   └──────────┘                   └────────┘ │
│        │                                                                    │
│        │ 3. Build CDN URL (Frontend)                                        │
│        │    useMediaUrl() → ImageKit SDK                                    │
│        ▼                                                                    │
│   ┌──────────┐    4. Request     ┌──────────┐    5. Fetch       ┌────────┐ │
│   │  <img>   │ ──────────────▶   │ ImageKit │ ──────────────▶   │  AWS   │ │
│   │  Tag     │    Transform      │   CDN    │    Origin         │  S3    │ │
│   └──────────┘                   └──────────┘                   └────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Media ID Correlation (Presign → Webhook)

The `media_id` embedded in the S3 path is the key to correlating presign requests with webhook callbacks:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MEDIA ID CORRELATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. PRESIGN REQUEST (API)                                                   │
│     ├── pathBuilder.buildPath() generates: mediaId = "med_abc123456789"     │
│     ├── Builds S3 path: "org_x/logo/2025/01/06/med_abc123456789_T.png"      │
│     ├── INSERT media record: id = "med_abc123456789", status = "pending"    │
│     └── Return: { mediaId, uploadUrl, storagePath }                         │
│                                                                             │
│  2. BROWSER UPLOADS to S3 (using presigned URL)                             │
│     └── Object created at: s3://bucket/org_x/logo/.../med_abc123456789_T.png│
│                                                                             │
│  3. LAMBDA TRIGGERED (S3 ObjectCreated event)                               │
│     ├── Receives S3 key containing the media ID                             │
│     ├── pathBuilder.parsePath(key) extracts: mediaId = "med_abc123456789"   │
│     └── Calls webhook with: { key, mediaId, size, width, height }           │
│                                                                             │
│  4. WEBHOOK HANDLER (API)                                                   │
│     └── update_media_by_pk(id: "med_abc123456789", status: "ready")         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key Implementation Points:**
- `mediaId` format: `med_${nanoid(12)}` (e.g., `med_V1StGXR8_Z5j`)
- S3 path embeds mediaId: `{org}/{type}/{date}/{mediaId}_{timestamp}.{ext}`
- Database record created BEFORE upload with `status: pending`
- Webhook updates EXISTING record by primary key after validation

### S3 Bucket Path Structure

```
testimonials-{stage}-uploads/
├── {organization_id}/
│   ├── organization_logo/
│   │   └── 2025/01/05/med_abc123_20250105T143022.png
│   ├── contact_avatar/
│   │   └── 2025/01/05/med_def456_20250105T150000.jpg
│   ├── testimonial_video/
│   │   └── 2025/01/05/med_ghi789_20250105T160000.mp4
│   └── form_attachment/
│       └── 2025/01/05/med_jkl012_20250105T170000.pdf
```

### Existing Infrastructure

AWS CDK infrastructure is already scaffolded at `infrastructure/`. This implementation extends the existing setup.

**AWS Accounts** (per-environment isolation):
| Environment | Account ID | Bucket Name | AWS Profile |
|-------------|------------|-------------|-------------|
| Dev | 378257622586 | `testimonials-dev-uploads` | `testimonials-dev` |
| QA | 745791801068 | `testimonials-qa-uploads` | `testimonials-qa` |
| Prod | 405062306867 | `testimonials-prod-uploads` | `testimonials-prod` |

**Existing CDK Resources** (leverage these):
| File | Purpose |
|------|---------|
| `infrastructure/constructs/s3.ts` | S3 bucket construct with CORS, encryption, lifecycle |
| `infrastructure/constructs/lambda.ts` | Lambda construct with Node.js 20.x, ARM64, X-Ray |
| `infrastructure/stacks/storage-stack.ts` | Storage stack (uploads bucket already deployed) |
| `infrastructure/config/stages.ts` | Stage configuration with bucket names, API URLs |

**S3 Bucket Already Configured With**:
- Encryption: S3-managed
- Public access: Blocked
- CORS: Frontend origins (localhost for dev, vercel for staging, app domain for prod)
- Lifecycle: Delete incomplete multipart uploads after 7 days
- Removal policy: RETAIN for prod, DESTROY for non-prod

**Lambda Directory**: New Lambda functions go in `infrastructure/lambdas/`

**Related Documentation**:
- `docs/infrastructure/aws-overview.md` - AWS account structure
- `docs/infrastructure/service-patterns.md` - Naming conventions
- `docs/infrastructure/deployment-guide.md` - CDK deployment workflow

---

## Phase 1: Database Schema

### 1.1 Create media_entity_types Lookup Table

**File:** `db/hasura/migrations/default/TIMESTAMP_create_media_entity_types_table/up.sql`

```sql
-- ============================================================================
-- MEDIA ENTITY TYPES LOOKUP TABLE
-- ============================================================================
-- Purpose: Define valid entity types for media uploads with validation rules.
--          This table enforces referential integrity for the polymorphic
--          association in the media table (entity_type + entity_id pattern).
--
-- Why a lookup table instead of CHECK constraint?
--   1. Validation rules (mime types, sizes) are queryable at runtime
--   2. New entity types can be added without schema migrations
--   3. Self-documenting - describes what each type means and where it links
--   4. Can be extended with additional metadata (icons, UI hints, etc.)
--
-- Usage: The media.entity_type column references this table's `code` column.
--        API/Lambda should query this table to get validation rules.
-- ============================================================================

CREATE TABLE public.media_entity_types (
  -- Unique identifier (opaque NanoID)
  -- Following project convention: IDs should be meaningless
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

  -- Semantic code used as FK target from media.entity_type
  -- Use lowercase_snake_case. Examples: organization_logo, contact_avatar
  -- UNIQUE constraint allows it to be used as FK target
  code TEXT NOT NULL UNIQUE,

  -- Human-readable name for UI display
  display_name TEXT NOT NULL,

  -- Detailed description explaining the purpose of this entity type
  description TEXT NOT NULL,

  -- Polymorphic association target: which table does entity_id reference?
  -- e.g., 'organizations' means media.entity_id -> organizations.id
  target_table TEXT NOT NULL,

  -- Which column in target_table is referenced (usually 'id')
  target_column TEXT NOT NULL DEFAULT 'id',

  -- Array of allowed MIME types for this entity type
  -- Used by API (presign validation) and Lambda (content validation)
  -- Example: ARRAY['image/jpeg', 'image/png', 'image/webp']
  allowed_mime_types TEXT[] NOT NULL,

  -- Maximum file size in bytes
  -- Enforced at presign generation AND Lambda validation (defense in depth)
  max_file_size_bytes BIGINT NOT NULL,

  -- Soft toggle to enable/disable entity types
  -- Set to false for types not yet implemented (e.g., video)
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- User who created this entity type (nullable for seed data)
  created_by TEXT REFERENCES public.users(id),

  -- User who last modified this entity type
  updated_by TEXT REFERENCES public.users(id)
);

-- Trigger for auto-updating updated_at
CREATE TRIGGER set_media_entity_types_updated_at
  BEFORE UPDATE ON public.media_entity_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE AND COLUMN COMMENTS (for documentation and Hasura introspection)
-- ============================================================================

COMMENT ON TABLE public.media_entity_types IS
  'Lookup table defining valid media entity types with validation rules.

   This table serves multiple purposes:
   1. Enforces valid values for media.entity_type via FK constraint on `code`
   2. Stores validation rules (mime types, max size) queryable at runtime
   3. Documents the polymorphic relationship (which table entity_id references)
   4. Allows enabling/disabling entity types without code changes

   When adding a new entity type:
   1. INSERT a new row with appropriate validation rules
   2. Update Lambda validator if needed (for content-based validation)
   3. Update frontend upload config to match';

COMMENT ON COLUMN public.media_entity_types.id IS
  'Opaque unique identifier (NanoID 12-char). Following project convention
   that IDs should be meaningless. Use `code` for semantic lookups.';

COMMENT ON COLUMN public.media_entity_types.code IS
  'Semantic code for the entity type. Use lowercase_snake_case.
   Examples: organization_logo, contact_avatar, testimonial_video.
   This value is stored in media.entity_type (FK target).
   UNIQUE constraint allows foreign key references.';

COMMENT ON COLUMN public.media_entity_types.display_name IS
  'Human-readable name shown in UI. Example: "Organization Logo"';

COMMENT ON COLUMN public.media_entity_types.description IS
  'Detailed description of what this media type is used for.
   Helps developers understand the purpose and context.';

COMMENT ON COLUMN public.media_entity_types.target_table IS
  'The database table that media.entity_id references for this type.
   Example: "organizations" means entity_id is an organizations.id value.
   Used for documentation; actual FK validation is application-level.';

COMMENT ON COLUMN public.media_entity_types.target_column IS
  'The column in target_table that entity_id references. Usually "id".
   Allows flexibility for tables with non-standard PK names.';

COMMENT ON COLUMN public.media_entity_types.allowed_mime_types IS
  'PostgreSQL array of MIME types allowed for uploads of this entity type.
   Validated at two points:
   1. API presign endpoint (fast rejection)
   2. Lambda after upload (content-based verification)
   Example: ARRAY[''image/jpeg'', ''image/png'', ''image/webp'']';

COMMENT ON COLUMN public.media_entity_types.max_file_size_bytes IS
  'Maximum allowed file size in bytes. Enforced at:
   1. API presign endpoint (rejects before upload)
   2. Lambda validation (rejects after upload, deletes file)
   Common values: 2MB=2097152, 5MB=5242880, 10MB=10485760, 500MB=524288000';

COMMENT ON COLUMN public.media_entity_types.is_active IS
  'Whether this entity type is currently enabled for uploads.
   Set to false to disable without deleting (preserves existing references).
   Use for feature flags or deprecating entity types.';

COMMENT ON COLUMN public.media_entity_types.created_at IS
  'Timestamp when this entity type was created. For audit purposes.';

COMMENT ON COLUMN public.media_entity_types.updated_at IS
  'Timestamp of last modification. Auto-updated by trigger.';

COMMENT ON COLUMN public.media_entity_types.created_by IS
  'User who created this entity type. NULL for seed data inserted by migrations.
   References users.id.';

COMMENT ON COLUMN public.media_entity_types.updated_by IS
  'User who last modified this entity type. Set by application on updates.
   References users.id.';

-- ============================================================================
-- SEED DATA: Initial entity types
-- ============================================================================
-- Note: Validation rules here should match:
--   1. packages/libs/media-service/src/types/index.ts (ENTITY_VALIDATION_CONFIG)
--   2. infrastructure/lambdas/media-validator/src/validator.ts (ALLOWED_TYPES)
-- Keep these in sync when adding/modifying entity types.
-- ============================================================================

INSERT INTO public.media_entity_types
  (code, display_name, description, target_table, allowed_mime_types, max_file_size_bytes)
VALUES
  -- Organization logo: displayed in dashboard header, public forms, widgets
  ('organization_logo', 'Organization Logo',
   'Logo image displayed in dashboard header, public collection forms, and embedded widgets. Recommend square aspect ratio (1:1) for best display across contexts.',
   'organizations',
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
   5242880),  -- 5MB (generous for high-DPI logos)

  -- Contact avatar: profile photo for contacts/customers who submit testimonials
  ('contact_avatar', 'Contact Avatar',
   'Profile photo for a contact/customer. Displayed alongside their testimonials in widgets. Extracted from social profiles or uploaded manually.',
   'contacts',
   ARRAY['image/jpeg', 'image/png', 'image/webp'],
   2097152),  -- 2MB (sufficient for profile photos)

  -- Testimonial video: FUTURE - video testimonials from customers
  -- Marked inactive until video workflow (storage, encoding, delivery) is implemented
  ('testimonial_video', 'Testimonial Video',
   'Video testimonial recording from customer. Requires separate video processing workflow (transcoding, thumbnail generation). NOT YET IMPLEMENTED.',
   'testimonials',
   ARRAY['video/mp4', 'video/quicktime', 'video/webm'],
   524288000),  -- 500MB (videos can be large)

  -- Form attachment: files uploaded by customers via public form
  ('form_attachment', 'Form Attachment',
   'File uploaded by customer via public form submission. Supports images and PDFs. Associated with form_submissions table.',
   'form_submissions',
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
   10485760);  -- 10MB (reasonable for documents)

-- Disable video type until video workflow is implemented
-- This prevents uploads while keeping the definition for future use
UPDATE public.media_entity_types
SET is_active = false
WHERE code = 'testimonial_video';
```

**File:** `db/hasura/migrations/default/TIMESTAMP_create_media_entity_types_table/down.sql`

```sql
-- ============================================================================
-- ROLLBACK: Drop media_entity_types lookup table
-- ============================================================================
-- WARNING: This will fail if media table exists with FK constraint.
--          Drop media table first, or remove FK constraint.
-- ============================================================================

-- Drop trigger first (depends on table)
DROP TRIGGER IF EXISTS set_media_entity_types_updated_at ON public.media_entity_types;

-- Drop table
DROP TABLE IF EXISTS public.media_entity_types;
```

### 1.2 Create media Table

**File:** `db/hasura/migrations/default/TIMESTAMP_create_media_table/up.sql`

```sql
-- ============================================================================
-- MEDIA TABLE
-- ============================================================================
-- Purpose: Centralized tracking for all uploaded media files.
--          Supports images now, extensible for video in the future.
--
-- Key Design Decisions:
--   1. PROVIDER-AGNOSTIC: storage_provider + storage_path allow migration
--      between S3, GCS, Azure without changing application code
--   2. CDN VIA ENV VARS: CDN configuration (ImageKit/Cloudinary) is not
--      stored per-record - it's deployment config via environment variables
--   3. POLYMORPHIC ASSOCIATION: entity_type + entity_id pattern allows
--      linking media to any entity (org logos, avatars, attachments)
--   4. LAMBDA-SOURCED DIMENSIONS: width/height are extracted by Lambda
--      after upload, not client-provided (prevents spoofing)
--
-- Upload Flow:
--   1. Client requests presigned URL from API
--   2. API creates pending record (status='pending', dims=NULL)
--   3. Client uploads directly to S3
--   4. Lambda validates file, extracts dimensions
--   5. Lambda calls webhook with dimensions
--   6. API updates record (status='ready', dims populated)
--
-- Related Tables:
--   - media_entity_types: Lookup table for entity_type validation
--   - organizations: For organization_id FK and org isolation
--   - users: For uploaded_by FK (audit trail)
-- ============================================================================

CREATE TABLE public.media (
  -- -------------------------------------------------------------------------
  -- PRIMARY KEY
  -- -------------------------------------------------------------------------
  -- Using NanoID for URL-safe, collision-resistant IDs
  -- Format: 12-character alphanumeric string (e.g., 'V1StGXR8_Z5j')
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

  -- -------------------------------------------------------------------------
  -- MULTI-TENANCY: Organization isolation
  -- -------------------------------------------------------------------------
  -- All media belongs to an organization for tenant isolation
  -- ON DELETE CASCADE: When org is deleted, all its media is deleted
  -- Hasura RLS uses X-Hasura-Organization-Id to filter queries
  organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- -------------------------------------------------------------------------
  -- FILE METADATA: Information about the uploaded file
  -- -------------------------------------------------------------------------
  -- Original filename as uploaded by user (for display purposes)
  -- Note: Actual storage uses generated path, not this filename
  filename TEXT NOT NULL,

  -- MIME type of the file (e.g., 'image/png', 'video/mp4')
  -- Validated at upload time against entity_type's allowed_mime_types
  mime_type TEXT NOT NULL,

  -- File size in bytes
  -- Initially from presign request, updated by Lambda with actual size
  -- Used for quota tracking and validation
  file_size_bytes BIGINT NOT NULL,

  -- -------------------------------------------------------------------------
  -- STORAGE: Provider-agnostic storage information
  -- -------------------------------------------------------------------------
  -- Storage provider identifier for multi-cloud support
  -- Current: 'aws_s3'. Future: 'gcs', 'azure_blob'
  -- Used by storage adapter to select correct SDK
  storage_provider TEXT NOT NULL DEFAULT 'aws_s3',

  -- S3 bucket name (or equivalent for other providers)
  -- Example: 'testimonials-prod-uploads'
  storage_bucket TEXT NOT NULL,

  -- Full object path within the bucket - THE PORTABLE KEY
  -- Pattern: {org_id}/{entity_type}/{YYYY}/{MM}/{DD}/{media_id}_{timestamp}.{ext}
  -- Example: 'org_abc123/organization_logo/2025/01/05/med_xyz789_20250105T143022.png'
  --
  -- This path is the key to provider portability:
  -- To migrate to a new provider, copy files preserving this path structure
  storage_path TEXT NOT NULL,

  -- Storage region (for multi-region setups)
  -- Example: 'ap-south-1', 'us-east-1'
  -- NULL if using single-region deployment
  storage_region TEXT,

  -- -------------------------------------------------------------------------
  -- POLYMORPHIC ASSOCIATION: What entity does this media belong to?
  -- -------------------------------------------------------------------------
  -- Entity type from lookup table (enforces valid types)
  -- Examples: 'organization_logo', 'contact_avatar', 'form_attachment'
  -- FK references media_entity_types.code (semantic identifier, not id)
  entity_type TEXT NOT NULL REFERENCES public.media_entity_types(code),

  -- ID of the entity this media belongs to (polymorphic FK)
  -- The actual table referenced depends on entity_type:
  --   'organization_logo' -> organizations.id
  --   'contact_avatar' -> contacts.id
  --   'form_attachment' -> form_submissions.id
  --
  -- NULL is allowed for:
  --   1. Pending uploads not yet linked to an entity
  --   2. Orphaned media (entity was deleted but media retained)
  entity_id TEXT,

  -- -------------------------------------------------------------------------
  -- PROCESSING STATUS: Track upload lifecycle
  -- -------------------------------------------------------------------------
  -- Status of the media upload/processing pipeline
  -- Transitions: pending -> uploading -> processing -> ready
  --              or: pending -> failed / processing -> failed
  --
  -- States:
  --   'pending': Presigned URL generated, waiting for upload
  --   'uploading': Upload in progress (optional, set by client)
  --   'processing': Lambda is validating/processing
  --   'ready': Successfully uploaded and validated, available for use
  --   'failed': Upload or validation failed (see error_message)
  --   'deleted': Soft deleted, pending cleanup
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'uploading', 'processing', 'ready', 'failed', 'deleted')),

  -- Error message if status is 'failed'
  -- Contains human-readable description of what went wrong
  -- Example: 'File type image/gif not allowed for organization_logo'
  error_message TEXT,

  -- Provider-specific metadata as JSONB
  -- Stores information like: etag, uploadedAt, contentType from S3
  -- Flexible schema for provider-specific data
  processing_metadata JSONB DEFAULT '{}',

  -- -------------------------------------------------------------------------
  -- IMAGE DIMENSIONS: Extracted by Lambda after upload
  -- -------------------------------------------------------------------------
  -- Width in pixels (NULL until Lambda processes the file)
  -- Only populated for image files, not PDFs
  width INTEGER,

  -- Height in pixels (NULL until Lambda processes the file)
  -- Only populated for image files, not PDFs
  height INTEGER,

  -- -------------------------------------------------------------------------
  -- VIDEO METADATA: Reserved for future video support
  -- -------------------------------------------------------------------------
  -- Duration in seconds (for video files)
  -- Currently unused - will be populated by video processing pipeline
  -- Using DECIMAL for sub-second precision
  duration_seconds DECIMAL(10, 2),

  -- Path to auto-generated video thumbnail
  -- Will be populated by video processing pipeline
  -- Stored in same bucket as video, different path
  thumbnail_path TEXT,

  -- -------------------------------------------------------------------------
  -- AUDIT FIELDS: Who uploaded and when
  -- -------------------------------------------------------------------------
  -- User who initiated the upload (for audit trail)
  -- NULL for system-generated uploads or anonymous submissions
  uploaded_by TEXT REFERENCES public.users(id),

  -- Timestamps for audit and lifecycle management
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES: Optimize common query patterns
-- ============================================================================

-- Organization isolation queries (most common filter)
-- Used by: All queries with X-Hasura-Organization-Id
CREATE INDEX idx_media_organization_id ON public.media(organization_id);

-- Entity lookup: Find media for a specific entity
-- Used by: "Get logo for organization X", "Get avatar for contact Y"
CREATE INDEX idx_media_entity ON public.media(entity_type, entity_id);

-- Status filtering: Find pending/failed uploads for cleanup
-- Used by: Admin dashboards, cleanup jobs
CREATE INDEX idx_media_status ON public.media(status);

-- Recent uploads: Sort by creation date
-- Used by: Media library views, recent uploads list
CREATE INDEX idx_media_created_at ON public.media(created_at DESC);

-- Unique storage path: Prevent duplicate uploads to same path
-- This should never happen with proper path generation, but provides safety
CREATE UNIQUE INDEX idx_media_storage_unique ON public.media(storage_bucket, storage_path);

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE public.media IS
  'Centralized tracking for all uploaded media files.

   Architecture:
   - Storage: AWS S3 (provider-agnostic via storage_* columns)
   - CDN: ImageKit (configured via environment variables, not stored here)
   - Uploads: Direct to S3 via presigned URLs (no server proxy)
   - Validation: Lambda function validates after upload, extracts dimensions

   Key Fields for Portability:
   - storage_provider: Which cloud provider (aws_s3, gcs, azure_blob)
   - storage_bucket: Bucket/container name
   - storage_path: Full object path (the migration key)

   To migrate to new storage provider:
   1. Copy all files preserving storage_path structure
   2. Update storage_provider and storage_bucket columns
   3. Update environment variables for storage adapter

   To migrate to new CDN:
   1. Configure new CDN to use same storage as origin
   2. Update CDN environment variables (VITE_CDN_BASE_URL)
   3. No database changes needed';

COMMENT ON COLUMN public.media.id IS
  'Unique identifier using NanoID (12 chars, URL-safe).
   Format: med_xxxxxxxxxxxx (when prefixed in paths)
   Used in storage_path and API responses.';

COMMENT ON COLUMN public.media.organization_id IS
  'Organization that owns this media. Required for multi-tenant isolation.
   All Hasura queries are filtered by X-Hasura-Organization-Id header.
   Cascading delete removes media when organization is deleted.';

COMMENT ON COLUMN public.media.filename IS
  'Original filename as provided by the user during upload.
   Used for display purposes only - actual storage uses generated path.
   Preserved for user reference and download suggestions.';

COMMENT ON COLUMN public.media.mime_type IS
  'MIME type of the uploaded file (e.g., image/png, application/pdf).
   Validated against entity_type allowed_mime_types at:
   1. Presign generation (API)
   2. Post-upload validation (Lambda - from file content)';

COMMENT ON COLUMN public.media.file_size_bytes IS
  'File size in bytes. Initially from presign request, may be updated
   by Lambda with actual uploaded size. Used for:
   - Quota tracking per organization
   - Validation against entity_type max_file_size_bytes';

COMMENT ON COLUMN public.media.storage_provider IS
  'Cloud storage provider identifier. Determines which SDK/adapter to use.
   Values: aws_s3 (current), gcs (future), azure_blob (future).
   Enables multi-cloud and provider migration without code changes.';

COMMENT ON COLUMN public.media.storage_bucket IS
  'Storage bucket/container name. Example: testimonials-prod-uploads.
   Combined with storage_path to form full object URL.';

COMMENT ON COLUMN public.media.storage_path IS
  'Full object path within bucket - THE PORTABLE KEY for migration.
   Pattern: {org_id}/{entity_type}/{YYYY}/{MM}/{DD}/{media_id}_{timestamp}.{ext}
   Example: org_abc123/organization_logo/2025/01/05/med_xyz789_20250105T143022.png

   Design rationale:
   - org_id first: Enables bucket policies per org, easy data export
   - entity_type second: Allows different storage classes per type
   - Date partitioning: Optimizes S3 LIST, enables lifecycle policies
   - Unique suffix: Prevents collisions, aids debugging';

COMMENT ON COLUMN public.media.storage_region IS
  'Storage region for multi-region deployments (e.g., ap-south-1).
   NULL for single-region setups. Used when constructing storage URLs.';

COMMENT ON COLUMN public.media.entity_type IS
  'Type of entity this media belongs to. FK references media_entity_types.code.
   Determines: validation rules, target table for entity_id, UI behavior.
   Examples: organization_logo, contact_avatar, form_attachment';

COMMENT ON COLUMN public.media.entity_id IS
  'ID of the entity this media belongs to (polymorphic foreign key).
   Target table depends on entity_type (see media_entity_types.target_table).
   NULL allowed for: pending uploads, orphaned media after entity deletion.';

COMMENT ON COLUMN public.media.status IS
  'Current status in the upload lifecycle:
   - pending: Presigned URL generated, awaiting upload
   - uploading: Upload in progress (optional client-set state)
   - processing: Lambda validating/processing the file
   - ready: Successfully uploaded and validated
   - failed: Upload or validation failed (see error_message)
   - deleted: Soft deleted, awaiting cleanup job';

COMMENT ON COLUMN public.media.error_message IS
  'Human-readable error description when status is "failed".
   Examples: "File type not allowed", "File size exceeds limit", "Invalid image"';

COMMENT ON COLUMN public.media.processing_metadata IS
  'JSONB storage for provider-specific metadata. Contents vary by provider.
   Typical S3 data: { etag, uploadedAt, contentType, versionId }
   Flexible schema allows storing any relevant processing information.';

COMMENT ON COLUMN public.media.width IS
  'Image width in pixels. NULL until Lambda extracts from uploaded file.
   Only populated for image MIME types, not PDFs or other documents.
   Extracted using image-size library in Lambda (reads headers, fast).';

COMMENT ON COLUMN public.media.height IS
  'Image height in pixels. NULL until Lambda extracts from uploaded file.
   Only populated for image MIME types, not PDFs or other documents.
   Extracted using image-size library in Lambda (reads headers, fast).';

COMMENT ON COLUMN public.media.duration_seconds IS
  'Video duration in seconds. RESERVED FOR FUTURE VIDEO SUPPORT.
   Currently always NULL. Will be populated by video processing pipeline
   when video testimonials feature is implemented.';

COMMENT ON COLUMN public.media.thumbnail_path IS
  'Auto-generated video thumbnail path. RESERVED FOR FUTURE VIDEO SUPPORT.
   Currently always NULL. Will store path to thumbnail image generated
   by video processing pipeline.';

COMMENT ON COLUMN public.media.uploaded_by IS
  'User who initiated the upload. References users table.
   NULL for: system uploads, anonymous form submissions.
   Used for audit trail and usage tracking.';

COMMENT ON COLUMN public.media.created_at IS
  'Timestamp when the media record was created (presign request time).
   Note: This is when upload was initiated, not when it completed.';

COMMENT ON COLUMN public.media.updated_at IS
  'Timestamp of last update. Automatically updated by trigger.
   Useful for tracking when status changed to ready/failed.';

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================

CREATE TRIGGER set_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**File:** `db/hasura/migrations/default/TIMESTAMP_create_media_table/down.sql`

```sql
-- ============================================================================
-- ROLLBACK: Drop media table
-- ============================================================================
-- This will:
--   1. Drop the updated_at trigger
--   2. Drop the media table and all its indexes
--   3. Leave media_entity_types table intact (drop separately if needed)
--
-- WARNING: This will permanently delete all media records.
--          Actual files in S3 are NOT deleted - run cleanup job first.
-- ============================================================================

-- Drop trigger first (depends on table)
DROP TRIGGER IF EXISTS set_media_updated_at ON public.media;

-- Drop table (indexes are dropped automatically)
DROP TABLE IF EXISTS public.media;
```

### 1.3 Hasura Metadata for media_entity_types Table

**File:** `db/hasura/metadata/databases/default/tables/public_media_entity_types.yaml`

```yaml
table:
  name: media_entity_types
  schema: public

configuration:
  column_config: {}
  custom_column_names:
    id: id
    code: code
    display_name: displayName
    description: description
    target_table: targetTable
    target_column: targetColumn
    allowed_mime_types: allowedMimeTypes
    max_file_size_bytes: maxFileSizeBytes
    is_active: isActive
    created_at: createdAt
    updated_at: updatedAt
    created_by: createdBy
    updated_by: updatedBy
  custom_root_fields: {}

# Read-only for all roles - this is a lookup table
select_permissions:
  - role: user
    permission:
      columns:
        - id
        - code
        - display_name
        - description
        - target_table
        - allowed_mime_types
        - max_file_size_bytes
        - is_active
      filter:
        is_active:
          _eq: true
      allow_aggregations: false
```

### 1.4 Hasura Metadata for media Table

**File:** `db/hasura/metadata/databases/default/tables/public_media.yaml`

```yaml
table:
  name: media
  schema: public

configuration:
  column_config: {}
  custom_column_names:
    id: id
    organization_id: organizationId
    filename: filename
    mime_type: mimeType
    file_size_bytes: fileSizeBytes
    storage_provider: storageProvider
    storage_bucket: storageBucket
    storage_path: storagePath
    storage_region: storageRegion
    entity_type: entityType
    entity_id: entityId
    status: status
    error_message: errorMessage
    processing_metadata: processingMetadata
    width: width
    height: height
    duration_seconds: durationSeconds
    thumbnail_path: thumbnailPath
    uploaded_by: uploadedBy
    created_at: createdAt
    updated_at: updatedAt
  custom_root_fields: {}

object_relationships:
  - name: organization
    using:
      foreign_key_constraint_on: organization_id
  - name: uploader
    using:
      foreign_key_constraint_on: uploaded_by
  - name: entityTypeConfig
    using:
      foreign_key_constraint_on: entity_type

select_permissions:
  - role: user
    permission:
      columns:
        - id
        - organization_id
        - filename
        - mime_type
        - file_size_bytes
        - storage_provider
        - storage_bucket
        - storage_path
        - storage_region
        - entity_type
        - entity_id
        - status
        - width
        - height
        - created_at
        - updated_at
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      allow_aggregations: true

insert_permissions:
  - role: user
    permission:
      columns:
        - filename
        - mime_type
        - file_size_bytes
        - storage_provider
        - storage_bucket
        - storage_path
        - storage_region
        - entity_type
        - entity_id
        - status
      check:
        organization_id:
          _eq: X-Hasura-Organization-Id
      set:
        organization_id: X-Hasura-Organization-Id
        uploaded_by: X-Hasura-User-Id

update_permissions:
  - role: user
    permission:
      columns:
        - entity_id
        - status
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
      check: null

delete_permissions:
  - role: user
    permission:
      filter:
        organization_id:
          _eq: X-Hasura-Organization-Id
```

**File:** `db/hasura/metadata/databases/default/tables/tables.yaml`

Add to the list:
```yaml
- "!include public_media_entity_types.yaml"
- "!include public_media.yaml"
```

---

## Phase 2: Shared Media Service Library

### 2.1 Package Structure

**File:** `packages/libs/media-service/package.json`

```json
{
  "name": "@testimonials/media-service",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./adapters": "./src/adapters/index.ts",
    "./validators": "./src/core/validators.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.700.0",
    "@aws-sdk/s3-request-presigner": "^3.700.0",
    "file-type": "^19.6.0",
    "nanoid": "^5.0.9"
  },
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

**File:** `packages/libs/media-service/tsconfig.json`

```json
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"]
}
```

### 2.2 Type Definitions

**File:** `packages/libs/media-service/src/types/index.ts`

```typescript
// ============================================================
// STORAGE ADAPTER TYPES
// ============================================================

export type StorageProvider = 'aws_s3' | 'gcs' | 'azure_blob';

export interface PresignParams {
  bucket: string;
  key: string;
  contentType: string;
  contentLength: number;
  expiresInSeconds?: number;
  metadata?: Record<string, string>;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers: Record<string, string>;
  expiresAt: Date;
}

export interface ObjectMetadata {
  contentType: string;
  contentLength: number;
  etag?: string;
  lastModified?: Date;
  metadata?: Record<string, string>;
}

export interface StorageAdapter {
  readonly provider: StorageProvider;

  generatePresignedUploadUrl(params: PresignParams): Promise<PresignedUploadResult>;
  generatePresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
  getObjectMetadata(key: string): Promise<ObjectMetadata>;
  objectExists(key: string): Promise<boolean>;
}

// ============================================================
// CDN ADAPTER TYPES
// CDN configuration comes from environment variables, not database
// ============================================================

export interface ImageTransforms {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  quality?: number;
  blur?: number;
  grayscale?: boolean;
  focusOn?: 'face' | 'auto' | 'center';
}

export interface CDNConfig {
  baseUrl: string;      // From VITE_CDN_BASE_URL or CDN_BASE_URL
  pathPrefix?: string;  // From VITE_CDN_PATH_PREFIX or CDN_PATH_PREFIX
}

export interface CDNAdapter {
  getTransformUrl(storagePath: string, transforms?: ImageTransforms): string;
  getOriginalUrl(storagePath: string): string;
  getThumbnailUrl(storagePath: string, size?: number): string;
}

// ============================================================
// MEDIA ENTITY TYPES (matches database lookup table)
// ============================================================

export type EntityType =
  | 'organization_logo'
  | 'contact_avatar'
  | 'testimonial_video'  // Reserved for future
  | 'form_attachment';

export type MediaStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'deleted';

export interface MediaRecord {
  id: string;
  organizationId: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  storageProvider: StorageProvider;
  storageBucket: string;
  storagePath: string;
  storageRegion?: string;
  entityType: EntityType;
  entityId?: string;
  status: MediaStatus;
  errorMessage?: string;
  processingMetadata?: Record<string, unknown>;
  width?: number;
  height?: number;
  // Reserved for future video support
  durationSeconds?: number;
  thumbnailPath?: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// UPLOAD REQUEST TYPES
// ============================================================

export interface UploadRequest {
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  entityType: EntityType;
  entityId?: string;
  organizationId: string;
  userId: string;
}

export interface UploadInitResult {
  mediaId: string;
  uploadUrl: string;
  storagePath: string;
  expiresAt: Date;
  headers: Record<string, string>;
}

// ============================================================
// WEBHOOK TYPES
// Lambda sends dimensions after extracting from file
// ============================================================

export interface S3EventRecord {
  bucket: string;
  key: string;
  size: number;
  contentType: string;
  etag: string;
  eventTime: string;
  // Image dimensions extracted by Lambda
  width?: number;
  height?: number;
}

export interface WebhookPayload {
  event: 'upload_complete' | 'upload_failed';
  record: S3EventRecord;
  signature: string;
  timestamp: number;
}

// ============================================================
// VALIDATION TYPES
// Note: Production should fetch these from media_entity_types table
// These are compile-time defaults for type safety
// ============================================================

export interface ValidationConfig {
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
}

// Image-only entity types for current implementation
export const IMAGE_ENTITY_TYPES: EntityType[] = [
  'organization_logo',
  'contact_avatar',
  'form_attachment',
];

export const ENTITY_VALIDATION_CONFIG: Record<EntityType, ValidationConfig> = {
  organization_logo: {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
  contact_avatar: {
    maxFileSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  testimonial_video: {
    // Reserved for future - not currently active
    maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
  },
  form_attachment: {
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf',
    ],
  },
};
```

### 2.3 S3 Storage Adapter

**File:** `packages/libs/media-service/src/adapters/storage/s3.adapter.ts`

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  StorageAdapter,
  StorageProvider,
  PresignParams,
  PresignedUploadResult,
  ObjectMetadata,
} from '../../types';

export interface S3AdapterConfig {
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string; // For S3-compatible services (MinIO, etc.)
}

export class S3StorageAdapter implements StorageAdapter {
  readonly provider: StorageProvider = 'aws_s3';

  private client: S3Client;
  private bucket: string;

  constructor(config: S3AdapterConfig) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region,
      credentials: config.accessKeyId && config.secretAccessKey
        ? {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          }
        : undefined,
      endpoint: config.endpoint,
      forcePathStyle: !!config.endpoint, // Required for MinIO/LocalStack
    });
  }

  async generatePresignedUploadUrl(params: PresignParams): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: params.bucket || this.bucket,
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
      Metadata: params.metadata,
    });

    const expiresIn = params.expiresInSeconds ?? 900; // 15 minutes default
    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn });

    return {
      uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': params.contentType,
        'Content-Length': String(params.contentLength),
      },
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  async generatePresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async getObjectMetadata(key: string): Promise<ObjectMetadata> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    return {
      contentType: response.ContentType ?? 'application/octet-stream',
      contentLength: response.ContentLength ?? 0,
      etag: response.ETag,
      lastModified: response.LastModified,
      metadata: response.Metadata,
    };
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.getObjectMetadata(key);
      return true;
    } catch (error) {
      if ((error as { name: string }).name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
}
```

### 2.4 ImageKit CDN Adapter

**File:** `packages/libs/media-service/src/adapters/cdn/imagekit.adapter.ts`

```typescript
import type { CDNAdapter, CDNConfig, ImageTransforms } from '../../types';

/**
 * ImageKit CDN Adapter
 * Configuration comes from environment variables:
 * - VITE_CDN_BASE_URL / CDN_BASE_URL
 * - VITE_CDN_PATH_PREFIX / CDN_PATH_PREFIX
 */
export class ImageKitCDNAdapter implements CDNAdapter {
  private baseUrl: string;
  private pathPrefix: string;

  constructor(config: CDNConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.pathPrefix = config.pathPrefix ?? '';
  }

  getTransformUrl(storagePath: string, transforms?: ImageTransforms): string {
    const url = `${this.baseUrl}${this.pathPrefix}/${storagePath}`;

    if (!transforms || Object.keys(transforms).length === 0) {
      return url;
    }

    const params = this.buildTransformParams(transforms);
    return `${url}?tr=${params}`;
  }

  getOriginalUrl(storagePath: string): string {
    return `${this.baseUrl}${this.pathPrefix}/${storagePath}`;
  }

  getThumbnailUrl(storagePath: string, size = 150): string {
    return this.getTransformUrl(storagePath, {
      width: size,
      height: size,
      fit: 'cover',
      format: 'auto',
    });
  }

  private buildTransformParams(transforms: ImageTransforms): string {
    const parts: string[] = [];

    if (transforms.width) {
      parts.push(`w-${transforms.width}`);
    }

    if (transforms.height) {
      parts.push(`h-${transforms.height}`);
    }

    if (transforms.fit) {
      const fitMap: Record<string, string> = {
        cover: 'c-maintain_ratio',
        contain: 'c-at_max',
        fill: 'c-force',
        inside: 'c-at_max',
        outside: 'c-at_least',
      };
      parts.push(fitMap[transforms.fit] || 'c-maintain_ratio');
    }

    if (transforms.format) {
      if (transforms.format === 'auto') {
        parts.push('f-auto');
      } else {
        parts.push(`f-${transforms.format}`);
      }
    }

    if (transforms.quality) {
      parts.push(`q-${transforms.quality}`);
    }

    if (transforms.blur) {
      parts.push(`bl-${transforms.blur}`);
    }

    if (transforms.grayscale) {
      parts.push('e-grayscale');
    }

    if (transforms.focusOn) {
      const focusMap: Record<string, string> = {
        face: 'fo-face',
        auto: 'fo-auto',
        center: 'fo-center',
      };
      parts.push(focusMap[transforms.focusOn] || 'fo-auto');
    }

    return parts.join(',');
  }
}
```

### 2.5 Path Builder Utility

**File:** `packages/libs/media-service/src/core/pathBuilder.ts`

```typescript
import { nanoid } from 'nanoid';
import type { EntityType } from '../types';

export interface PathBuilderConfig {
  timezone?: string; // Default: 'Asia/Kolkata'
}

/**
 * Builds S3 storage paths following the pattern:
 * {organization_id}/{entity_type}/{year}/{month}/{day}/{media_id}_{timestamp}.{ext}
 */
export class PathBuilder {
  private timezone: string;

  constructor(config: PathBuilderConfig = {}) {
    this.timezone = config.timezone ?? 'Asia/Kolkata';
  }

  /**
   * Generate a unique storage path for a new upload
   */
  buildPath(params: {
    organizationId: string;
    entityType: EntityType;
    filename: string;
    mediaId?: string;
  }): { mediaId: string; storagePath: string } {
    const mediaId = params.mediaId ?? `med_${nanoid(12)}`;
    const extension = this.getExtension(params.filename);
    const timestamp = this.getTimestamp();
    const datePath = this.getDatePath();

    const storagePath = [
      params.organizationId,
      params.entityType,
      datePath,
      `${mediaId}_${timestamp}.${extension}`,
    ].join('/');

    return { mediaId, storagePath };
  }

  /**
   * Parse an existing storage path to extract components
   */
  parsePath(storagePath: string): {
    organizationId: string;
    entityType: EntityType;
    year: string;
    month: string;
    day: string;
    mediaId: string;
    timestamp: string;
    extension: string;
  } | null {
    const pattern = /^([^/]+)\/([^/]+)\/(\d{4})\/(\d{2})\/(\d{2})\/([^_]+)_(\d{8}T\d{6})\.(.+)$/;
    const match = storagePath.match(pattern);

    if (!match) {
      return null;
    }

    return {
      organizationId: match[1],
      entityType: match[2] as EntityType,
      year: match[3],
      month: match[4],
      day: match[5],
      mediaId: match[6],
      timestamp: match[7],
      extension: match[8],
    };
  }

  /**
   * Validate that a path matches the expected pattern
   */
  isValidPath(storagePath: string): boolean {
    return this.parsePath(storagePath) !== null;
  }

  private getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : 'bin';
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, '')
      .replace('T', 'T');
  }

  private getDatePath(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }
}

// Singleton instance with default config
export const pathBuilder = new PathBuilder();
```

### 2.6 Validators

**File:** `packages/libs/media-service/src/core/validators.ts`

```typescript
import { fileTypeFromBuffer } from 'file-type';
import type { EntityType, ValidationConfig } from '../types';
import { ENTITY_VALIDATION_CONFIG } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate file metadata before generating presigned URL
 */
export function validateUploadRequest(params: {
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  entityType: EntityType;
}): ValidationResult {
  const errors: string[] = [];
  const config = ENTITY_VALIDATION_CONFIG[params.entityType];

  if (!config) {
    errors.push(`Unknown entity type: ${params.entityType}`);
    return { valid: false, errors };
  }

  // Check file size
  if (params.fileSizeBytes > config.maxFileSizeBytes) {
    const maxMB = (config.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
    const actualMB = (params.fileSizeBytes / (1024 * 1024)).toFixed(1);
    errors.push(`File size ${actualMB}MB exceeds maximum ${maxMB}MB for ${params.entityType}`);
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(params.mimeType)) {
    errors.push(
      `MIME type ${params.mimeType} not allowed for ${params.entityType}. ` +
      `Allowed: ${config.allowedMimeTypes.join(', ')}`
    );
  }

  // Check filename extension matches MIME type
  const ext = params.filename.split('.').pop()?.toLowerCase();
  const expectedExtensions = getMimeExtensions(params.mimeType);
  if (ext && expectedExtensions.length > 0 && !expectedExtensions.includes(ext)) {
    errors.push(
      `File extension .${ext} doesn't match MIME type ${params.mimeType}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate actual file content (for Lambda validation)
 */
export async function validateFileContent(
  buffer: Buffer,
  expectedMimeType: string,
  entityType: EntityType
): Promise<ValidationResult> {
  const errors: string[] = [];
  const config = ENTITY_VALIDATION_CONFIG[entityType];

  if (!config) {
    errors.push(`Unknown entity type: ${entityType}`);
    return { valid: false, errors };
  }

  // Check actual file size
  if (buffer.length > config.maxFileSizeBytes) {
    const maxMB = (config.maxFileSizeBytes / (1024 * 1024)).toFixed(1);
    const actualMB = (buffer.length / (1024 * 1024)).toFixed(1);
    errors.push(`File size ${actualMB}MB exceeds maximum ${maxMB}MB`);
  }

  // Detect actual MIME type from file magic bytes
  const detected = await fileTypeFromBuffer(buffer);

  if (!detected) {
    // Some files like SVG don't have magic bytes
    if (expectedMimeType !== 'image/svg+xml') {
      errors.push('Could not detect file type from content');
    }
  } else {
    // Check detected type matches expected
    if (detected.mime !== expectedMimeType) {
      errors.push(
        `Detected MIME type ${detected.mime} doesn't match claimed type ${expectedMimeType}`
      );
    }

    // Check detected type is allowed
    if (!config.allowedMimeTypes.includes(detected.mime)) {
      errors.push(
        `Detected MIME type ${detected.mime} not allowed for ${entityType}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get expected file extensions for a MIME type
 */
function getMimeExtensions(mimeType: string): string[] {
  const map: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
    'image/svg+xml': ['svg'],
    'video/mp4': ['mp4', 'm4v'],
    'video/quicktime': ['mov', 'qt'],
    'video/webm': ['webm'],
    'application/pdf': ['pdf'],
  };

  return map[mimeType] ?? [];
}

/**
 * Get validation config for an entity type
 */
export function getValidationConfig(entityType: EntityType): ValidationConfig {
  return ENTITY_VALIDATION_CONFIG[entityType];
}
```

### 2.7 Main Media Service

**File:** `packages/libs/media-service/src/core/MediaService.ts`

```typescript
import type {
  StorageAdapter,
  CDNAdapter,
  UploadRequest,
  UploadInitResult,
  EntityType,
  ImageTransforms,
} from '../types';
import { PathBuilder } from './pathBuilder';
import { validateUploadRequest } from './validators';

export interface MediaServiceConfig {
  storageAdapter: StorageAdapter;
  cdnAdapter: CDNAdapter;
  bucket: string;
  cdnBaseUrl: string;
}

export class MediaService {
  private storage: StorageAdapter;
  private cdn: CDNAdapter;
  private pathBuilder: PathBuilder;
  private bucket: string;
  private cdnBaseUrl: string;

  constructor(config: MediaServiceConfig) {
    this.storage = config.storageAdapter;
    this.cdn = config.cdnAdapter;
    this.pathBuilder = new PathBuilder();
    this.bucket = config.bucket;
    this.cdnBaseUrl = config.cdnBaseUrl;
  }

  /**
   * Initialize an upload - validate and generate presigned URL
   */
  async initializeUpload(request: UploadRequest): Promise<UploadInitResult> {
    // Validate the upload request
    const validation = validateUploadRequest({
      filename: request.filename,
      mimeType: request.mimeType,
      fileSizeBytes: request.fileSizeBytes,
      entityType: request.entityType,
    });

    if (!validation.valid) {
      throw new Error(`Upload validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate storage path
    const { mediaId, storagePath } = this.pathBuilder.buildPath({
      organizationId: request.organizationId,
      entityType: request.entityType,
      filename: request.filename,
    });

    // Generate presigned URL
    const presigned = await this.storage.generatePresignedUploadUrl({
      bucket: this.bucket,
      key: storagePath,
      contentType: request.mimeType,
      contentLength: request.fileSizeBytes,
      expiresInSeconds: 900, // 15 minutes
      metadata: {
        'x-media-id': mediaId,
        'x-organization-id': request.organizationId,
        'x-user-id': request.userId,
        'x-entity-type': request.entityType,
        'x-original-filename': request.filename,
      },
    });

    return {
      mediaId,
      uploadUrl: presigned.uploadUrl,
      storagePath,
      expiresAt: presigned.expiresAt,
      headers: presigned.headers,
    };
  }

  /**
   * Get CDN URL for displaying media
   */
  getDisplayUrl(storagePath: string, transforms?: ImageTransforms): string {
    return this.cdn.getTransformUrl(storagePath, transforms);
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(storagePath: string, size = 150): string {
    return this.cdn.getThumbnailUrl(storagePath, size);
  }

  /**
   * Get original URL (no transforms)
   */
  getOriginalUrl(storagePath: string): string {
    return this.cdn.getOriginalUrl(storagePath);
  }

  /**
   * Delete media from storage
   */
  async deleteMedia(storagePath: string): Promise<void> {
    await this.storage.deleteObject(storagePath);
  }

  /**
   * Check if media exists in storage
   */
  async mediaExists(storagePath: string): Promise<boolean> {
    return this.storage.objectExists(storagePath);
  }

  /**
   * Get storage and CDN provider info (for database record)
   */
  getProviderInfo(): {
    storageProvider: string;
    storageBucket: string;
    cdnProvider: string;
    cdnBaseUrl: string;
  } {
    return {
      storageProvider: this.storage.provider,
      storageBucket: this.bucket,
      cdnProvider: this.cdn.provider,
      cdnBaseUrl: this.cdnBaseUrl,
    };
  }
}
```

### 2.8 Package Exports

**File:** `packages/libs/media-service/src/index.ts`

```typescript
// Types
export * from './types';

// Core
export { MediaService } from './core/MediaService';
export type { MediaServiceConfig } from './core/MediaService';
export { PathBuilder, pathBuilder } from './core/pathBuilder';
export {
  validateUploadRequest,
  validateFileContent,
  getValidationConfig,
} from './core/validators';

// Adapters
export { S3StorageAdapter } from './adapters/storage/s3.adapter';
export type { S3AdapterConfig } from './adapters/storage/s3.adapter';
export { ImageKitCDNAdapter } from './adapters/cdn/imagekit.adapter';
export type { ImageKitConfig } from './adapters/cdn/imagekit.adapter';
```

**File:** `packages/libs/media-service/src/adapters/index.ts`

```typescript
export { S3StorageAdapter } from './storage/s3.adapter';
export type { S3AdapterConfig } from './storage/s3.adapter';

export { ImageKitCDNAdapter } from './cdn/imagekit.adapter';
export type { ImageKitConfig } from './cdn/imagekit.adapter';
```

---

## Phase 3: API Endpoints

### 3.1 Media Service Factory

**File:** `api/src/services/media/index.ts`

```typescript
import {
  MediaService,
  S3StorageAdapter,
  ImageKitCDNAdapter,
} from '@testimonials/media-service';

let mediaService: MediaService | null = null;

export function getMediaService(): MediaService {
  if (!mediaService) {
    const s3Adapter = new S3StorageAdapter({
      region: process.env.AWS_REGION!,
      bucket: process.env.S3_MEDIA_BUCKET!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const imagekitAdapter = new ImageKitCDNAdapter({
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
      pathPrefix: '/testimonials',
    });

    mediaService = new MediaService({
      storageAdapter: s3Adapter,
      cdnAdapter: imagekitAdapter,
      bucket: process.env.S3_MEDIA_BUCKET!,
      cdnBaseUrl: process.env.IMAGEKIT_URL_ENDPOINT!,
    });
  }

  return mediaService;
}
```

### 3.2 Presign Endpoint

**File:** `api/src/routes/media.ts`

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getMediaService } from '../services/media';
import { getHasuraClient } from '../services/hasura';
import type { EntityType, MediaStatus } from '@testimonials/media-service';

const mediaRoutes = new Hono();

// Schema for presign request
const presignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().positive().max(500 * 1024 * 1024), // 500MB max
  entityType: z.enum([
    'organization_logo',
    'contact_avatar',
    'testimonial_video',
    'form_attachment',
  ]),
  entityId: z.string().optional(),
});

// POST /media/presign - Generate presigned upload URL
mediaRoutes.post(
  '/presign',
  zValidator('json', presignRequestSchema),
  async (c) => {
    const body = c.req.valid('json');
    const organizationId = c.get('organizationId');
    const userId = c.get('userId');

    if (!organizationId || !userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const mediaService = getMediaService();

      // Initialize upload (validates and generates presigned URL)
      const result = await mediaService.initializeUpload({
        filename: body.filename,
        mimeType: body.mimeType,
        fileSizeBytes: body.fileSizeBytes,
        entityType: body.entityType as EntityType,
        entityId: body.entityId,
        organizationId,
        userId,
      });

      // Get provider info for database record
      const providerInfo = mediaService.getProviderInfo();

      // Create pending media record in database
      const hasura = getHasuraClient();
      await hasura.request({
        query: `
          mutation CreatePendingMedia($object: media_insert_input!) {
            insert_media_one(object: $object) {
              id
            }
          }
        `,
        variables: {
          object: {
            id: result.mediaId,
            organization_id: organizationId,
            filename: body.filename,
            mime_type: body.mimeType,
            file_size_bytes: body.fileSizeBytes,
            storage_provider: providerInfo.storageProvider,
            storage_bucket: providerInfo.storageBucket,
            storage_path: result.storagePath,
            storage_region: process.env.AWS_REGION,
            cdn_provider: providerInfo.cdnProvider,
            cdn_base_url: providerInfo.cdnBaseUrl,
            entity_type: body.entityType,
            entity_id: body.entityId,
            status: 'pending' as MediaStatus,
            uploaded_by: userId,
          },
        },
      });

      return c.json({
        mediaId: result.mediaId,
        uploadUrl: result.uploadUrl,
        storagePath: result.storagePath,
        expiresAt: result.expiresAt.toISOString(),
        headers: result.headers,
      });
    } catch (error) {
      console.error('Presign error:', error);
      return c.json(
        { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
        400
      );
    }
  }
);

// GET /media/:id - Get media record
mediaRoutes.get('/:id', async (c) => {
  const mediaId = c.req.param('id');
  const organizationId = c.get('organizationId');

  if (!organizationId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const hasura = getHasuraClient();
    const result = await hasura.request({
      query: `
        query GetMedia($id: String!, $orgId: String!) {
          media_by_pk(id: $id) {
            id
            filename
            mime_type
            file_size_bytes
            storage_path
            cdn_base_url
            entity_type
            entity_id
            status
            width
            height
            duration_seconds
            thumbnail_path
            created_at
            updated_at
          }
        }
      `,
      variables: { id: mediaId, orgId: organizationId },
    });

    if (!result.media_by_pk) {
      return c.json({ error: 'Media not found' }, 404);
    }

    // Add display URLs
    const mediaService = getMediaService();
    const media = result.media_by_pk;

    return c.json({
      ...media,
      displayUrl: mediaService.getDisplayUrl(media.storage_path),
      thumbnailUrl: mediaService.getThumbnailUrl(media.storage_path),
    });
  } catch (error) {
    console.error('Get media error:', error);
    return c.json({ error: 'Failed to fetch media' }, 500);
  }
});

// DELETE /media/:id - Soft delete media
mediaRoutes.delete('/:id', async (c) => {
  const mediaId = c.req.param('id');
  const organizationId = c.get('organizationId');

  if (!organizationId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const hasura = getHasuraClient();

    // Update status to deleted (soft delete)
    await hasura.request({
      query: `
        mutation SoftDeleteMedia($id: String!, $orgId: String!) {
          update_media(
            where: { id: { _eq: $id }, organization_id: { _eq: $orgId } }
            _set: { status: "deleted" }
          ) {
            affected_rows
          }
        }
      `,
      variables: { id: mediaId, orgId: organizationId },
    });

    // Note: Actual S3 deletion happens via scheduled cleanup job
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return c.json({ error: 'Failed to delete media' }, 500);
  }
});

export { mediaRoutes };
```

### 3.3 S3 Webhook Endpoint

**File:** `api/src/routes/webhooks/s3-media.ts`

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { getHasuraClient } from '../../services/hasura';
import { pathBuilder } from '@testimonials/media-service';

const s3MediaWebhook = new Hono();

// Schema for webhook payload from Lambda (includes dimensions)
const webhookPayloadSchema = z.object({
  event: z.enum(['upload_complete', 'upload_failed']),
  record: z.object({
    bucket: z.string(),
    key: z.string(),
    size: z.number(),
    contentType: z.string(),
    etag: z.string(),
    eventTime: z.string(),
    // Image dimensions extracted by Lambda
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  signature: z.string(),
  timestamp: z.number(),
});

// Verify HMAC signature from Lambda
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.MEDIA_WEBHOOK_SECRET;
  if (!secret) {
    console.error('MEDIA_WEBHOOK_SECRET not configured');
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// POST /webhooks/s3-media-upload - Called by Lambda after S3 upload
s3MediaWebhook.post(
  '/s3-media-upload',
  zValidator('json', webhookPayloadSchema),
  async (c) => {
    const body = c.req.valid('json');
    const rawBody = await c.req.text();

    // Verify signature
    if (!verifySignature(rawBody, body.signature)) {
      console.error('Invalid webhook signature');
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // Check timestamp (prevent replay attacks - 5 minute window)
    const now = Date.now();
    const timeDiff = Math.abs(now - body.timestamp);
    if (timeDiff > 5 * 60 * 1000) {
      console.error('Webhook timestamp too old');
      return c.json({ error: 'Request expired' }, 401);
    }

    const { event, record } = body;
    const hasura = getHasuraClient();

    // Parse media ID from storage path
    const parsed = pathBuilder.parsePath(record.key);
    if (!parsed) {
      console.error('Invalid storage path:', record.key);
      return c.json({ error: 'Invalid storage path' }, 400);
    }

    const mediaId = parsed.mediaId;

    try {
      if (event === 'upload_complete') {
        // Update media record to ready status with dimensions
        await hasura.request({
          query: `
            mutation MarkMediaReady(
              $id: String!,
              $size: bigint!,
              $width: Int,
              $height: Int,
              $metadata: jsonb!
            ) {
              update_media_by_pk(
                pk_columns: { id: $id }
                _set: {
                  status: "ready",
                  file_size_bytes: $size,
                  width: $width,
                  height: $height,
                  processing_metadata: $metadata
                }
              ) {
                id
              }
            }
          `,
          variables: {
            id: mediaId,
            size: record.size,
            width: record.width ?? null,
            height: record.height ?? null,
            metadata: {
              etag: record.etag,
              uploadedAt: record.eventTime,
              contentType: record.contentType,
            },
          },
        });

        console.log(`Media ${mediaId} marked as ready (${record.width}x${record.height})`);
      } else if (event === 'upload_failed') {
        // Mark as failed
        await hasura.request({
          query: `
            mutation MarkMediaFailed($id: String!, $error: String!) {
              update_media_by_pk(
                pk_columns: { id: $id }
                _set: {
                  status: "failed",
                  error_message: $error
                }
              ) {
                id
              }
            }
          `,
          variables: {
            id: mediaId,
            error: 'Upload validation failed',
          },
        });

        console.log(`Media ${mediaId} marked as failed`);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      return c.json({ error: 'Failed to process webhook' }, 500);
    }
  }
);

export { s3MediaWebhook };
```

### 3.4 Register Routes

**File:** `api/src/index.ts` (update)

```typescript
import { mediaRoutes } from './routes/media';
import { s3MediaWebhook } from './routes/webhooks/s3-media';

// ... existing routes

// Media routes (authenticated)
app.route('/media', mediaRoutes);

// Webhook routes (signature-authenticated)
app.route('/webhooks', s3MediaWebhook);
```

---

## Phase 4: Lambda Function

### 4.1 Lambda Project Structure

```
infrastructure/lambdas/media-validator/
├── src/
│   ├── index.ts
│   ├── validator.ts
│   └── webhook.ts
├── package.json
├── tsconfig.json
└── esbuild.config.js
```

### 4.2 Lambda Handler

**File:** `infrastructure/lambdas/media-validator/src/index.ts`

```typescript
import type { S3Event, S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { validateFile } from './validator';
import { callWebhook } from './webhook';

const s3Client = new S3Client({});

// Valid path pattern
const VALID_PATH_PATTERN =
  /^[a-zA-Z0-9_-]+\/(organization_logo|contact_avatar|testimonial_video|form_attachment)\/\d{4}\/\d{2}\/\d{2}\/med_[a-zA-Z0-9_-]+_\d{8}T\d{6}\.[a-zA-Z0-9]+$/;

export const handler: S3Handler = async (event: S3Event) => {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const size = record.s3.object.size;
    const eventTime = record.eventTime;

    console.log(`Processing: ${bucket}/${key} (${size} bytes)`);

    // Step 1: Validate path pattern
    if (!VALID_PATH_PATTERN.test(key)) {
      console.error(`Invalid path pattern: ${key}`);
      await deleteInvalidFile(bucket, key);
      continue;
    }

    // Step 2: Extract entity type from path
    const pathParts = key.split('/');
    const entityType = pathParts[1] as string;

    // Step 3: Fetch file content for validation
    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3Client.send(command);

      if (!response.Body) {
        console.error('Empty file body');
        await deleteInvalidFile(bucket, key);
        await callWebhook('upload_failed', { bucket, key, size, eventTime, etag: '' });
        continue;
      }

      // Get first 4KB for magic byte detection
      const chunks: Uint8Array[] = [];
      let totalSize = 0;
      const maxBytes = 4096;

      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
        totalSize += chunk.length;
        if (totalSize >= maxBytes) break;
      }

      const buffer = Buffer.concat(chunks).slice(0, maxBytes);

      // Step 4: Validate file content and extract dimensions
      const validation = await validateFile(buffer, entityType, size);

      if (!validation.valid) {
        console.error(`Validation failed: ${validation.errors.join(', ')}`);
        await deleteInvalidFile(bucket, key);
        await callWebhook('upload_failed', {
          bucket,
          key,
          size,
          contentType: '',
          eventTime,
          etag: record.s3.object.eTag || '',
        });
        continue;
      }

      // Step 5: Call webhook on success (with dimensions)
      await callWebhook('upload_complete', {
        bucket,
        key,
        size,
        contentType: validation.detectedMimeType || '',
        eventTime,
        etag: record.s3.object.eTag || '',
        width: validation.width,
        height: validation.height,
      });

      console.log(`Successfully validated: ${key}`);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
      await callWebhook('upload_failed', {
        bucket,
        key,
        size,
        eventTime,
        etag: record.s3.object.eTag || '',
      });
    }
  }
};

async function deleteInvalidFile(bucket: string, key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
    await s3Client.send(command);
    console.log(`Deleted invalid file: ${bucket}/${key}`);
  } catch (error) {
    console.error(`Failed to delete invalid file: ${bucket}/${key}`, error);
  }
}
```

### 4.3 Validator (with Dimension Extraction)

**File:** `infrastructure/lambdas/media-validator/src/validator.ts`

```typescript
import { fileTypeFromBuffer } from 'file-type';
import imageSize from 'image-size';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  detectedMimeType?: string;
  // Image dimensions extracted from file
  width?: number;
  height?: number;
}

// Image-only entity types for current implementation
const ALLOWED_TYPES: Record<string, { mimeTypes: string[]; maxSizeBytes: number }> = {
  organization_logo: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
  },
  contact_avatar: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
  },
  form_attachment: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
  },
  // testimonial_video: Reserved for future implementation
};

export async function validateFile(
  buffer: Buffer,
  entityType: string,
  fileSize: number
): Promise<ValidationResult> {
  const errors: string[] = [];
  let width: number | undefined;
  let height: number | undefined;

  const config = ALLOWED_TYPES[entityType];
  if (!config) {
    return { valid: false, errors: [`Unknown entity type: ${entityType}`] };
  }

  // Check file size
  if (fileSize > config.maxSizeBytes) {
    const maxMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1);
    const actualMB = (fileSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size ${actualMB}MB exceeds maximum ${maxMB}MB`);
  }

  // Detect MIME type from magic bytes
  const detected = await fileTypeFromBuffer(buffer);
  let detectedMimeType: string | undefined;

  if (detected) {
    detectedMimeType = detected.mime;

    if (!config.mimeTypes.includes(detected.mime)) {
      errors.push(
        `File type ${detected.mime} not allowed for ${entityType}. ` +
        `Allowed: ${config.mimeTypes.join(', ')}`
      );
    }

    // Extract dimensions for images (not PDFs)
    if (detected.mime.startsWith('image/')) {
      try {
        const dimensions = imageSize(buffer);
        width = dimensions.width;
        height = dimensions.height;
        console.log(`Extracted dimensions: ${width}x${height}`);
      } catch (err) {
        console.warn('Could not extract image dimensions:', err);
        // Non-fatal - continue without dimensions
      }
    }
  } else {
    // SVG files don't have magic bytes - try to detect as SVG
    const content = buffer.toString('utf8', 0, 1000);
    if (content.includes('<svg') || content.includes('<?xml')) {
      detectedMimeType = 'image/svg+xml';
      if (!config.mimeTypes.includes('image/svg+xml')) {
        errors.push(`SVG not allowed for ${entityType}`);
      }
      // Note: SVG dimensions would need XML parsing, skip for now
    } else {
      console.log('Could not detect file type from magic bytes');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    detectedMimeType,
    width,
    height,
  };
}
```

### 4.4 Webhook Caller (with Dimensions)

**File:** `infrastructure/lambdas/media-validator/src/webhook.ts`

```typescript
import crypto from 'crypto';

interface WebhookRecord {
  bucket: string;
  key: string;
  size: number;
  contentType: string;
  eventTime: string;
  etag: string;
  // Image dimensions (extracted by validator)
  width?: number;
  height?: number;
}

export async function callWebhook(
  event: 'upload_complete' | 'upload_failed',
  record: WebhookRecord
): Promise<void> {
  const webhookUrl = process.env.WEBHOOK_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    console.error('Webhook URL or secret not configured');
    return;
  }

  const timestamp = Date.now();
  const payload = JSON.stringify({ event, record, timestamp });

  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        record,
        signature,
        timestamp,
      }),
    });

    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`);
    } else {
      console.log(`Webhook success: ${event} for ${record.key} (${record.width}x${record.height})`);
    }
  } catch (error) {
    console.error('Webhook call failed:', error);
  }
}
```

### 4.5 Lambda Package

**File:** `infrastructure/lambdas/media-validator/package.json`

```json
{
  "name": "media-validator",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "esbuild src/index.ts --bundle --platform=node --target=node20 --outfile=dist/index.js --external:@aws-sdk/*",
    "zip": "cd dist && zip -r ../function.zip ."
  },
  "dependencies": {
    "file-type": "^19.6.0",
    "image-size": "^1.1.1"
  },
  "devDependencies": {
    "@aws-sdk/client-s3": "^3.700.0",
    "@types/aws-lambda": "^8.10.145",
    "esbuild": "^0.24.0",
    "typescript": "^5.7.2"
  }
}
```

### 4.6 CDK Stack Integration

Add the Lambda to the existing storage stack using the `createLambda` construct.

**File:** `infrastructure/stacks/storage-stack.ts` (update existing)

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import type { Construct } from 'constructs';
import { getStageConfig, type Stage } from '../config';
import { createBucket, createLambda } from '../constructs';

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

  // S3 Bucket for uploads (already exists)
  const uploadsBucket = createBucket(stack, {
    id: 'UploadsBucket',
    bucketName: config.bucketName,
    stage: props.stage,
  });

  // Media Validator Lambda
  const mediaValidator = createLambda(stack, {
    id: 'MediaValidator',
    functionName: `testimonials-${props.stage}-media-validator`,
    codePath: 'media-validator/dist',
    handler: 'index.handler',
    memorySize: 512,
    timeout: 60,
    environment: {
      STAGE: props.stage,
      API_BASE_URL: config.apiBaseUrl,
      WEBHOOK_SECRET: cdk.SecretValue.secretsManager(
        `/testimonials/${props.stage}/media/webhook-secret`
      ).unsafeUnwrap(),
    },
  });

  // Grant Lambda permissions to read/delete from bucket
  uploadsBucket.grantRead(mediaValidator);
  uploadsBucket.grantDelete(mediaValidator);

  // Add S3 event notification trigger
  uploadsBucket.addEventNotification(
    cdk.aws_s3.EventType.OBJECT_CREATED,
    new s3Notifications.LambdaDestination(mediaValidator)
  );

  // Tags
  cdk.Tags.of(stack).add('Environment', props.stage);
  cdk.Tags.of(stack).add('Product', 'testimonials');
  cdk.Tags.of(stack).add('Owner', 'alosies');

  // Outputs
  new cdk.CfnOutput(stack, 'BucketName', {
    value: uploadsBucket.bucketName,
    description: 'S3 bucket for uploads',
    exportName: `testimonials-${props.stage}-uploads-bucket-name`,
  });

  new cdk.CfnOutput(stack, 'MediaValidatorArn', {
    value: mediaValidator.functionArn,
    description: 'Media validator Lambda ARN',
    exportName: `testimonials-${props.stage}-media-validator-arn`,
  });

  return stack;
}
```

**Deployment Commands:**

```bash
cd infrastructure

# Install dependencies
pnpm install

# Build Lambda
cd lambdas/media-validator && pnpm build && cd ../..

# Deploy to dev
pnpm cdk deploy TestimonialsStorage-dev --profile testimonials-dev

# Deploy to prod
pnpm cdk deploy TestimonialsStorage-prod --profile testimonials-prod
```

---

## Phase 5: Frontend Implementation

### 5.1 Media Entity Models

**File:** `apps/web/src/entities/media/models/media.ts`

```typescript
import type {
  EntityType,
  MediaStatus,
  StorageProvider,
  CDNProvider,
  ImageTransforms,
} from '@testimonials/media-service';

// Re-export for convenience
export type { EntityType, MediaStatus, ImageTransforms };

export interface Media {
  id: string;
  organizationId: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  storageProvider: StorageProvider;
  storageBucket: string;
  storagePath: string;
  storageRegion?: string;
  cdnProvider?: CDNProvider;
  cdnBaseUrl?: string;
  entityType: EntityType;
  entityId?: string;
  status: MediaStatus;
  errorMessage?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  thumbnailPath?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
  // Computed URLs (added by API)
  displayUrl?: string;
  thumbnailUrl?: string;
}
```

**File:** `apps/web/src/entities/media/models/upload.ts`

```typescript
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadConfig {
  maxFileSizeMB: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export interface UploadResult {
  mediaId: string;
  storagePath: string;
  displayUrl: string;
  thumbnailUrl: string;
}

export interface PresignResponse {
  mediaId: string;
  uploadUrl: string;
  storagePath: string;
  expiresAt: string;
  headers: Record<string, string>;
}

// Entity-specific upload configs
export const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  organization_logo: {
    maxFileSizeMB: 5,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
  },
  contact_avatar: {
    maxFileSizeMB: 2,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  testimonial_video: {
    maxFileSizeMB: 500,
    allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    allowedExtensions: ['.mp4', '.mov', '.webm'],
  },
};
```

**File:** `apps/web/src/entities/media/models/index.ts`

```typescript
export * from './media';
export * from './upload';
```

### 5.2 Upload Composable

**File:** `apps/web/src/entities/media/composables/useUploadMedia.ts`

```typescript
import { ref, computed } from 'vue';
import { useApi } from '@/shared/api';
import type {
  EntityType,
  UploadProgress,
  UploadResult,
  PresignResponse,
  UploadConfig,
} from '../models';
import { UPLOAD_CONFIGS } from '../models';

export interface UseUploadMediaOptions {
  entityType: EntityType;
  entityId?: string;
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

export function useUploadMedia(options: UseUploadMediaOptions) {
  const api = useApi();

  const isUploading = ref(false);
  const progress = ref<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const error = ref<Error | null>(null);
  const result = ref<UploadResult | null>(null);

  const config = computed<UploadConfig>(
    () => UPLOAD_CONFIGS[options.entityType] ?? UPLOAD_CONFIGS.organization_logo
  );

  /**
   * Validate file before upload
   */
  function validateFile(file: File): string | null {
    // Check file size
    const maxBytes = config.value.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${config.value.maxFileSizeMB}MB limit`;
    }

    // Check MIME type
    if (!config.value.allowedMimeTypes.includes(file.type)) {
      return `File type ${file.type} not allowed. Allowed: ${config.value.allowedMimeTypes.join(', ')}`;
    }

    return null;
  }

  /**
   * Upload a file
   */
  async function upload(file: File): Promise<UploadResult | null> {
    // Reset state
    isUploading.value = true;
    progress.value = { loaded: 0, total: file.size, percentage: 0 };
    error.value = null;
    result.value = null;

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Step 1: Get presigned URL
      const presignResponse = await api.post<PresignResponse>('/media/presign', {
        filename: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        entityType: options.entityType,
        entityId: options.entityId,
      });

      // Step 2: Upload directly to S3
      await uploadToS3(file, presignResponse);

      // Step 3: Build result
      const uploadResult: UploadResult = {
        mediaId: presignResponse.mediaId,
        storagePath: presignResponse.storagePath,
        displayUrl: buildDisplayUrl(presignResponse.storagePath),
        thumbnailUrl: buildThumbnailUrl(presignResponse.storagePath),
      };

      result.value = uploadResult;
      options.onSuccess?.(uploadResult);

      return uploadResult;
    } catch (err) {
      const uploadError = err instanceof Error ? err : new Error('Upload failed');
      error.value = uploadError;
      options.onError?.(uploadError);
      return null;
    } finally {
      isUploading.value = false;
    }
  }

  /**
   * Upload file to S3 using presigned URL
   */
  async function uploadToS3(file: File, presign: PresignResponse): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const newProgress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          progress.value = newProgress;
          options.onProgress?.(newProgress);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Send request
      xhr.open('PUT', presign.uploadUrl);

      // Set headers from presign response
      Object.entries(presign.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(file);
    });
  }

  /**
   * Build display URL using ImageKit
   */
  function buildDisplayUrl(storagePath: string): string {
    const baseUrl = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
    return `${baseUrl}/testimonials/${storagePath}`;
  }

  /**
   * Build thumbnail URL using ImageKit transforms
   */
  function buildThumbnailUrl(storagePath: string, size = 150): string {
    const baseUrl = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
    return `${baseUrl}/testimonials/${storagePath}?tr=w-${size},h-${size},c-maintain_ratio,fo-auto,f-auto`;
  }

  return {
    // State
    isUploading,
    progress,
    error,
    result,
    config,

    // Methods
    upload,
    validateFile,
    buildDisplayUrl,
    buildThumbnailUrl,
  };
}
```

### 5.3 Media URL Composable

**File:** `apps/web/src/entities/media/composables/useMediaUrl.ts`

```typescript
import { computed } from 'vue';
import type { ImageTransforms } from '../models';

export interface UseMediaUrlOptions {
  storagePath: string;
  cdnBaseUrl?: string;
}

export function useMediaUrl(options: UseMediaUrlOptions) {
  const baseUrl = computed(() => {
    return options.cdnBaseUrl ?? import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  });

  /**
   * Get URL with transforms
   */
  function getUrl(transforms?: ImageTransforms): string {
    const base = `${baseUrl.value}/testimonials/${options.storagePath}`;

    if (!transforms || Object.keys(transforms).length === 0) {
      return base;
    }

    const params = buildTransformParams(transforms);
    return `${base}?tr=${params}`;
  }

  /**
   * Get thumbnail URL
   */
  function getThumbnailUrl(size = 150): string {
    return getUrl({
      width: size,
      height: size,
      fit: 'cover',
      format: 'auto',
    });
  }

  /**
   * Get avatar URL (with face detection)
   */
  function getAvatarUrl(size = 100): string {
    return getUrl({
      width: size,
      height: size,
      fit: 'cover',
      format: 'auto',
      focusOn: 'face',
    });
  }

  /**
   * Get logo URL (max width, preserve aspect)
   */
  function getLogoUrl(maxWidth = 200): string {
    return getUrl({
      width: maxWidth,
      fit: 'contain',
      format: 'auto',
    });
  }

  /**
   * Build ImageKit transform string
   */
  function buildTransformParams(transforms: ImageTransforms): string {
    const parts: string[] = [];

    if (transforms.width) parts.push(`w-${transforms.width}`);
    if (transforms.height) parts.push(`h-${transforms.height}`);

    if (transforms.fit) {
      const fitMap: Record<string, string> = {
        cover: 'c-maintain_ratio',
        contain: 'c-at_max',
        fill: 'c-force',
      };
      parts.push(fitMap[transforms.fit] || 'c-maintain_ratio');
    }

    if (transforms.format) {
      parts.push(transforms.format === 'auto' ? 'f-auto' : `f-${transforms.format}`);
    }

    if (transforms.quality) parts.push(`q-${transforms.quality}`);
    if (transforms.blur) parts.push(`bl-${transforms.blur}`);
    if (transforms.focusOn) parts.push(`fo-${transforms.focusOn}`);

    return parts.join(',');
  }

  return {
    getUrl,
    getThumbnailUrl,
    getAvatarUrl,
    getLogoUrl,
  };
}
```

### 5.4 Media Uploader Component

**File:** `apps/web/src/entities/media/components/MediaUploader.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUploadMedia } from '../composables/useUploadMedia';
import type { EntityType, UploadResult } from '../models';

const props = defineProps<{
  entityType: EntityType;
  entityId?: string;
  currentUrl?: string;
  accept?: string;
  maxSizeMB?: number;
}>();

const emit = defineEmits<{
  uploaded: [result: UploadResult];
  error: [error: Error];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const previewUrl = ref<string | null>(null);

const {
  isUploading,
  progress,
  error,
  config,
  upload,
  validateFile,
} = useUploadMedia({
  entityType: props.entityType,
  entityId: props.entityId,
  onSuccess: (result) => {
    previewUrl.value = result.displayUrl;
    emit('uploaded', result);
  },
  onError: (err) => {
    emit('error', err);
  },
});

const displayUrl = computed(() => previewUrl.value ?? props.currentUrl);

const acceptTypes = computed(() => {
  return props.accept ?? config.value.allowedMimeTypes.join(',');
});

function openFilePicker() {
  fileInput.value?.click();
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await upload(file);
  }
  // Reset input
  target.value = '';
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  const file = event.dataTransfer?.files[0];
  if (file) {
    await upload(file);
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}
</script>

<template>
  <div class="media-uploader">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- Drop zone -->
    <div
      class="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors"
      :class="{
        'border-primary-400 bg-primary-50': isDragging,
        'border-gray-300 hover:border-gray-400': !isDragging && !isUploading,
        'border-gray-200 bg-gray-50': isUploading,
      }"
      @click="openFilePicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <!-- Current image preview -->
      <template v-if="displayUrl && !isUploading">
        <img
          :src="displayUrl"
          alt="Preview"
          class="max-h-24 max-w-full rounded object-contain"
        />
        <p class="mt-2 text-sm text-gray-500">
          Click or drag to replace
        </p>
      </template>

      <!-- Upload state -->
      <template v-else-if="isUploading">
        <div class="flex flex-col items-center gap-2">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p class="text-sm text-gray-600">
            Uploading... {{ progress.percentage }}%
          </p>
          <div class="h-2 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full bg-primary-500 transition-all"
              :style="{ width: `${progress.percentage}%` }"
            />
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <template v-else>
        <svg class="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-600">
          Click or drag file to upload
        </p>
        <p class="mt-1 text-xs text-gray-400">
          Max {{ config.maxFileSizeMB }}MB
        </p>
      </template>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error.message }}
    </p>
  </div>
</template>
```

### 5.5 Entity Exports

**File:** `apps/web/src/entities/media/index.ts`

```typescript
// Models
export * from './models';

// Composables
export { useUploadMedia } from './composables/useUploadMedia';
export { useMediaUrl } from './composables/useMediaUrl';

// Components
export { default as MediaUploader } from './components/MediaUploader.vue';
```

---

## Phase 6: Integration with Organization Logo

### 6.1 Update Organization Settings Form

**File:** `apps/web/src/entities/organization/components/OrganizationSettingsForm.vue` (update)

```vue
<script setup lang="ts">
import { MediaUploader } from '@/entities/media';
import type { UploadResult } from '@/entities/media';

// ... existing code

const handleLogoUploaded = async (result: UploadResult) => {
  // Update organization with new logo URL
  await updateOrganization({
    id: organization.value.id,
    logoUrl: result.displayUrl,
  });
};
</script>

<template>
  <form>
    <!-- Logo upload section -->
    <div class="form-group">
      <label class="form-label">Organization Logo</label>
      <MediaUploader
        entity-type="organization_logo"
        :entity-id="organization.id"
        :current-url="organization.logoUrl"
        @uploaded="handleLogoUploaded"
      />
      <p class="form-hint">
        Recommended size: 200x200px. Max 5MB.
      </p>
    </div>

    <!-- ... rest of form -->
  </form>
</template>
```

---

## Environment Variables

### API (.env)
```bash
# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_MEDIA_BUCKET=testimonials-prod-uploads

# ImageKit
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
IMAGEKIT_PUBLIC_KEY=public_xxx
IMAGEKIT_PRIVATE_KEY=private_xxx

# Webhook security
MEDIA_WEBHOOK_SECRET=your_webhook_secret
```

### Web App (.env)
```bash
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

### Lambda (environment)
```bash
WEBHOOK_URL=https://your-api.com/webhooks/s3-media-upload
WEBHOOK_SECRET=your_webhook_secret
```

---

## Implementation Order

### Step 1: Database (Day 1)
1. Create media table migration
2. Add Hasura metadata
3. Apply migration and metadata
4. Test with Hasura console

### Step 2: Media Service Library (Day 1-2)
1. Create package structure
2. Implement types
3. Implement S3 adapter
4. Implement ImageKit adapter
5. Implement validators and path builder
6. Implement MediaService class

### Step 3: API Endpoints (Day 2)
1. Create media service factory
2. Implement presign endpoint
3. Implement webhook endpoint
4. Register routes
5. Test with curl/Postman

### Step 4: Lambda Function (Day 2-3)
1. Create Lambda project
2. Implement handler
3. Implement validator
4. Implement webhook caller
5. Build and deploy
6. Configure S3 trigger

### Step 5: Frontend (Day 3-4)
1. Create media entity structure
2. Implement useUploadMedia
3. Implement useMediaUrl
4. Create MediaUploader component
5. Integrate with organization settings

### Step 6: Testing & Polish (Day 4)
1. End-to-end upload testing
2. Error handling verification
3. Progress tracking verification
4. Edge cases (large files, invalid types)

---

## Testing Checklist

- [ ] Presign endpoint returns valid S3 URL
- [ ] Direct upload to S3 works
- [ ] Lambda validates file type correctly
- [ ] Lambda rejects invalid files
- [ ] Webhook updates database status
- [ ] ImageKit serves images correctly
- [ ] Transforms work (resize, format)
- [ ] Progress tracking works in UI
- [ ] Error messages display correctly
- [ ] Organization logo updates work
- [ ] Large file upload works (video)
- [ ] Invalid file type rejected

---

## Files Summary

### New Files (25)

| File | Purpose |
|------|---------|
| `db/hasura/migrations/.../create_media_entity_types_table/up.sql` | Lookup table for entity types |
| `db/hasura/migrations/.../create_media_entity_types_table/down.sql` | Rollback |
| `db/hasura/migrations/.../create_media_table/up.sql` | Media table |
| `db/hasura/migrations/.../create_media_table/down.sql` | Rollback |
| `db/hasura/metadata/.../public_media_entity_types.yaml` | Hasura metadata for lookup |
| `db/hasura/metadata/.../public_media.yaml` | Hasura metadata for media |
| `packages/libs/media-service/package.json` | Package config |
| `packages/libs/media-service/tsconfig.json` | TypeScript config |
| `packages/libs/media-service/src/types/index.ts` | Type definitions |
| `packages/libs/media-service/src/adapters/storage/s3.adapter.ts` | S3 adapter |
| `packages/libs/media-service/src/adapters/cdn/imagekit.adapter.ts` | ImageKit adapter (uses env vars) |
| `packages/libs/media-service/src/core/pathBuilder.ts` | Path builder |
| `packages/libs/media-service/src/core/validators.ts` | Validators |
| `packages/libs/media-service/src/core/MediaService.ts` | Main service |
| `packages/libs/media-service/src/index.ts` | Package exports |
| `api/src/services/media/index.ts` | Service factory |
| `api/src/routes/media.ts` | Media routes |
| `api/src/routes/webhooks/s3-media.ts` | Webhook route (stores dimensions) |
| `infrastructure/lambdas/media-validator/src/index.ts` | Lambda handler |
| `infrastructure/lambdas/media-validator/src/validator.ts` | File validator + dimension extraction |
| `infrastructure/lambdas/media-validator/src/webhook.ts` | Webhook caller (sends dimensions) |
| `apps/web/src/entities/media/models/index.ts` | Media models |
| `apps/web/src/entities/media/composables/useUploadMedia.ts` | Upload composable |
| `apps/web/src/entities/media/composables/useMediaUrl.ts` | URL composable (uses env vars) |
| `apps/web/src/entities/media/components/MediaUploader.vue` | Upload component |

### Modified Files (4)

| File | Change |
|------|--------|
| `api/src/index.ts` | Register media routes |
| `db/hasura/metadata/.../tables.yaml` | Include new table metadata |
| `infrastructure/stacks/storage-stack.ts` | Add media-validator Lambda with S3 trigger |
| `apps/web/src/entities/organization/components/OrganizationSettingsForm.vue` | Add logo uploader |
