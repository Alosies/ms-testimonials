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
SELECT add_updated_at_trigger('media_entity_types', 'public');

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
