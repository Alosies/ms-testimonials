-- ============================================================================
-- MEDIA TABLE
-- ============================================================================
-- Purpose: Centralized tracking for all uploaded media files.
--          Provider-agnostic storage with polymorphic entity associations.
--
-- Upload Flow:
--   1. Frontend requests presigned URL from API
--   2. API creates media record (status='pending') and returns presign + mediaId
--   3. Frontend uploads directly to S3 using presigned URL
--   4. S3 triggers Lambda on upload completion
--   5. Lambda validates file and calls webhook with S3 path
--   6. Webhook parses mediaId from path and updates status to 'ready'
--
-- Key Design Decisions:
--   - storage_path is the portable key (can migrate to any provider)
--   - entity_type references media_entity_types.code (not id)
--   - entity_id is nullable for pending uploads (linked after processing)
--   - processing_metadata stores provider-specific data (ImageKit file_id, etc.)
-- ============================================================================

CREATE TABLE public.media (
  -- Primary key (opaque NanoID)
  id TEXT PRIMARY KEY DEFAULT generate_nanoid_12(),

  -- Organization isolation (tenant boundary)
  -- All media belongs to an organization for RLS and data export
  organization_id TEXT NOT NULL,

  -- Original file metadata
  filename TEXT NOT NULL,                    -- Original filename from upload
  mime_type TEXT NOT NULL,                   -- image/png, video/mp4, etc.
  file_size_bytes BIGINT NOT NULL,           -- Size for quota tracking

  -- Storage provider configuration (provider-agnostic)
  storage_provider TEXT NOT NULL DEFAULT 'aws_s3',  -- aws_s3, gcs, azure_blob
  storage_bucket TEXT NOT NULL,              -- Bucket name
  storage_path TEXT NOT NULL,                -- Full path within bucket (the portable key)
  storage_region TEXT,                       -- ap-south-1, us-east-1, etc.

  -- Polymorphic association
  -- entity_type references media_entity_types.code for validation rules
  -- entity_id links to the actual entity (nullable for pending uploads)
  entity_type TEXT NOT NULL,
  entity_id TEXT,                            -- Nullable until entity is created/linked

  -- Processing status workflow
  -- pending -> processing -> ready (success) or failed (error)
  -- deleted: soft delete, file may still exist in S3 for retention
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,                        -- Error details if status='failed'

  -- Provider-specific metadata (JSONB appropriate: truly dynamic)
  -- Examples: ImageKit file_id, CloudFront distribution_id, etc.
  processing_metadata JSONB NOT NULL DEFAULT '{}',

  -- Media dimensions (populated by Lambda after processing)
  width INTEGER,                             -- Image/video width in pixels
  height INTEGER,                            -- Image/video height in pixels

  -- Video-specific fields (reserved for future use)
  duration_seconds DECIMAL,                  -- Video duration
  thumbnail_path TEXT,                       -- Path to generated thumbnail

  -- Audit fields
  uploaded_by TEXT,                          -- User who initiated upload
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Organization isolation
ALTER TABLE public.media
  ADD CONSTRAINT fk_media_organization_id
  FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Entity type validation (references code, not id)
ALTER TABLE public.media
  ADD CONSTRAINT fk_media_entity_type
  FOREIGN KEY (entity_type) REFERENCES public.media_entity_types(code)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- User reference (nullable for anonymous uploads like form submissions)
ALTER TABLE public.media
  ADD CONSTRAINT fk_media_uploaded_by
  FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

-- Valid status values
ALTER TABLE public.media
  ADD CONSTRAINT chk_media_status
  CHECK (status IN ('pending', 'processing', 'ready', 'failed', 'deleted'));

-- File size must be positive
ALTER TABLE public.media
  ADD CONSTRAINT chk_media_file_size_positive
  CHECK (file_size_bytes > 0);

-- Dimensions must be positive if set
ALTER TABLE public.media
  ADD CONSTRAINT chk_media_width_positive
  CHECK (width IS NULL OR width > 0);

ALTER TABLE public.media
  ADD CONSTRAINT chk_media_height_positive
  CHECK (height IS NULL OR height > 0);

-- Duration must be non-negative if set
ALTER TABLE public.media
  ADD CONSTRAINT chk_media_duration_non_negative
  CHECK (duration_seconds IS NULL OR duration_seconds >= 0);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organization isolation - most common query pattern
CREATE INDEX idx_media_organization_id ON public.media(organization_id);

-- Polymorphic association lookup (find all media for an entity)
CREATE INDEX idx_media_entity ON public.media(entity_type, entity_id);

-- Status filtering (find pending uploads, failed uploads, etc.)
CREATE INDEX idx_media_status ON public.media(status);

-- Unique storage path (prevent duplicate uploads to same location)
CREATE UNIQUE INDEX idx_media_storage_path ON public.media(storage_bucket, storage_path);

-- Recent uploads query
CREATE INDEX idx_media_created_at ON public.media(created_at DESC);

-- Uploaded by user (for user's media dashboard)
CREATE INDEX idx_media_uploaded_by ON public.media(uploaded_by) WHERE uploaded_by IS NOT NULL;

-- ============================================================================
-- TRIGGER
-- ============================================================================

SELECT add_updated_at_trigger('media', 'public');

-- ============================================================================
-- TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE public.media IS
  'Centralized tracking for all uploaded media files.

   This table stores metadata for files uploaded to cloud storage (S3, GCS, etc.)
   and tracks their processing status through the upload workflow.

   Key features:
   1. Provider-agnostic: storage_path is portable across providers
   2. Polymorphic: entity_type + entity_id links to any entity type
   3. Status workflow: tracks upload from pending to ready/failed
   4. Audit trail: tracks who uploaded and when

   Upload flow:
   1. API creates media record with status=pending
   2. Frontend uploads to presigned URL
   3. Lambda validates and calls webhook
   4. Webhook updates status to ready/failed';

COMMENT ON COLUMN public.media.id IS
  'Opaque unique identifier (NanoID 12-char). This ID is embedded in the S3 path
   to correlate presigned URL with webhook callback.';

COMMENT ON COLUMN public.media.organization_id IS
  'Organization that owns this media. Used for RLS, quota tracking, and data export.
   All media queries should filter by organization_id.';

COMMENT ON COLUMN public.media.filename IS
  'Original filename from the upload. Preserved for display purposes.
   The actual storage path uses a sanitized, unique name.';

COMMENT ON COLUMN public.media.mime_type IS
  'MIME type of the file (e.g., image/png, video/mp4).
   Validated against media_entity_types.allowed_mime_types.';

COMMENT ON COLUMN public.media.file_size_bytes IS
  'File size in bytes. Used for quota tracking and validation against
   media_entity_types.max_file_size_bytes.';

COMMENT ON COLUMN public.media.storage_provider IS
  'Storage provider identifier. Default is aws_s3.
   Other possible values: gcs (Google Cloud), azure_blob, etc.
   Used by CDN adapter to construct URLs.';

COMMENT ON COLUMN public.media.storage_bucket IS
  'Bucket/container name where the file is stored.
   Environment-specific: testimonials-dev-uploads, testimonials-prod-uploads, etc.';

COMMENT ON COLUMN public.media.storage_path IS
  'Full object path within the bucket. This is the portable key.
   Format: {org_id}/{entity_type}/{year}/{month}/{day}/{media_id}_{timestamp}.{ext}
   Example: org_abc/organization_logo/2025/01/05/med_xyz_20250105T143022.png';

COMMENT ON COLUMN public.media.storage_region IS
  'AWS region or equivalent for other providers.
   Used for constructing direct S3 URLs if needed.';

COMMENT ON COLUMN public.media.entity_type IS
  'Type of entity this media is associated with.
   References media_entity_types.code (not id).
   Examples: organization_logo, contact_avatar, testimonial_video.';

COMMENT ON COLUMN public.media.entity_id IS
  'ID of the entity this media is associated with.
   Nullable for pending uploads (entity may not exist yet).
   The target table is defined in media_entity_types.target_table.';

COMMENT ON COLUMN public.media.status IS
  'Processing status of the media file.
   - pending: Upload initiated, waiting for file
   - processing: File received, being validated
   - ready: Validation passed, file is available
   - failed: Validation failed, see error_message
   - deleted: Soft deleted, file may be retained for backup';

COMMENT ON COLUMN public.media.error_message IS
  'Error details when status is failed.
   Examples: "File size exceeds limit", "Invalid MIME type", etc.';

COMMENT ON COLUMN public.media.processing_metadata IS
  'JSONB for provider-specific metadata.
   Examples: ImageKit file_id, CloudFront invalidation_id, virus scan results.
   This is appropriate use of JSONB: truly dynamic, provider-specific data.';

COMMENT ON COLUMN public.media.width IS
  'Width of image/video in pixels. Populated by Lambda after processing.
   NULL for non-image files.';

COMMENT ON COLUMN public.media.height IS
  'Height of image/video in pixels. Populated by Lambda after processing.
   NULL for non-image files.';

COMMENT ON COLUMN public.media.duration_seconds IS
  'Duration of video in seconds. Reserved for future video support.
   NULL for images.';

COMMENT ON COLUMN public.media.thumbnail_path IS
  'Storage path for video thumbnail. Reserved for future video support.
   Lambda generates thumbnail and stores path here.';

COMMENT ON COLUMN public.media.uploaded_by IS
  'User who initiated the upload. NULL for anonymous uploads
   (e.g., form submissions by external customers).
   References users.id.';

COMMENT ON COLUMN public.media.created_at IS
  'Timestamp when the media record was created (upload initiated).';

COMMENT ON COLUMN public.media.updated_at IS
  'Timestamp of last modification. Auto-updated by trigger.
   Changes when status updates, processing completes, etc.';
