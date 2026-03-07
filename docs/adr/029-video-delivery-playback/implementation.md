# ADR-029: Implementation Plan — Video Delivery, Playback & Transcoding

**Parent ADR**: [`adr.md`](./adr.md)

**Prerequisite ADR**: [`ADR-026`](../026-video-testimonials-mvp/adr.md) — schema changes (type column, video_media_id, video_media relationship) must be applied first.

---

## Skills Reference

Each phase maps to project skills that enforce standards. Use these skills during implementation.

| Skill | Used In | Purpose |
|-------|---------|---------|
| `/hasura-migrations` | Phase 0 | Create DB migrations for schema changes |
| `/hasura-permissions` | Phase 0 | Configure relationships and permissions for new columns |
| `/hasura-table-docs` | Phase 0 | Document schema changes |
| `/api-creator` | Phase 1 | Create Bunny webhook endpoint with OpenAPIHono + Zod |
| `/api-code-review` | Phase 1 | Validate API feature folder structure, pure/impure separation |
| `/graphql-code` | Phase 2 | Validate GraphQL fragments, run codegen, create composables |
| `/e2e-test-ids` | Phase 3 | Create centralized test IDs for video UI elements |
| `/e2e-tests-creator` | Phase 3, 4 | Create E2E tests for video upload and playback flows |
| `/code-review` | All phases | Review staged changes before committing |
| `/create-commits` | All phases | Create atomic commits with ADR-029 reference |
| `/s3-management` | Phase 1 | Verify S3 bucket access, lifecycle policies |

---

## Phase 0: Database Schema (ADR-026 Prerequisites)

**Goal**: Apply the schema changes defined in ADR-026 — add `type` and `video_media_id` columns to `testimonials`, enable the `testimonial_video` entity type, configure Hasura metadata.

> This phase implements ADR-026's "Phase 1: Database & API Foundation". It is a prerequisite for all subsequent phases.

### Steps

1. **`/hasura-migrations`** — Create migration: add `type` and `video_media_id` columns to `testimonials` table

    ```sql
    -- up.sql
    ALTER TABLE public.testimonials
      ADD COLUMN type TEXT NOT NULL DEFAULT 'text'
        CHECK (type IN ('text', 'video'));

    ALTER TABLE public.testimonials
      ADD COLUMN video_media_id TEXT REFERENCES public.media(id) ON DELETE SET NULL;

    CREATE INDEX idx_testimonials_type ON public.testimonials(type);

    COMMENT ON COLUMN public.testimonials.type IS
      'Testimonial format: text (AI-assembled or manual) or video (uploaded file)';
    COMMENT ON COLUMN public.testimonials.video_media_id IS
      'FK to media table for video testimonials. NULL for text testimonials.';
    ```

2. **`/hasura-migrations`** — Create migration: enable `testimonial_video` entity type

    ```sql
    -- up.sql
    UPDATE public.media_entity_types
    SET is_active = true
    WHERE code = 'testimonial_video';
    ```

3. **`/hasura-permissions`** — Update Hasura metadata:
    - Expose `type` and `video_media_id` columns in existing testimonials permissions (select, insert)
    - Add `video_media` **object relationship** on `testimonials` -> `media` (via `video_media_id`)
    - Add `video_media` relationship to select permissions for all roles that can read testimonials

4. **`/hasura-table-docs`** — Update testimonials table documentation with new columns and relationship

5. **`/graphql-code`** — Update `TestimonialBasic.gql` fragment:
    - Add `type` field
    - Add `video_media { id status duration_seconds thumbnail_path processing_metadata }` relationship
    - Validate fragment against Hasura schema using tm-graph MCP tools
    - Run `pnpm codegen:web` to regenerate TypeScript types

6. **`/graphql-code`** — Update entity models:
    - Re-export generated types in `apps/web/src/entities/testimonial/models/index.ts`
    - Add `TestimonialType = 'text' | 'video'` type alias if useful

### Files

```
db/hasura/migrations/default/{timestamp}__testimonials__add_video_columns/
├── up.sql                                                    # NEW
└── down.sql                                                  # NEW
db/hasura/migrations/default/{timestamp}__media_entity_types__enable_video/
├── up.sql                                                    # NEW
└── down.sql                                                  # NEW
db/hasura/metadata/databases/default/tables/
└── public_testimonials.yaml                                  # UPDATE: columns, relationship, permissions
apps/web/src/entities/testimonial/graphql/fragments/
└── TestimonialBasic.gql                                      # UPDATE: add type + video_media
apps/web/src/entities/testimonial/models/
└── index.ts                                                  # UPDATE: re-export new types
```

### Commit

```
feat(db, ADR-026, ADR-029): add video testimonial schema and Hasura metadata
```

### Testing Checklist

- [ ] Migrations apply cleanly (`hasura migrate apply`)
- [ ] Metadata applies cleanly (`hasura metadata apply`)
- [ ] Existing text testimonials unaffected (default `type = 'text'`)
- [ ] `video_media` relationship resolves in Hasura console
- [ ] GraphQL codegen succeeds (`pnpm codegen:web`)
- [ ] TypeScript compiles (`pnpm typecheck`)

---

## Phase 1: Bunny Stream Integration

**Goal**: After a video uploads to S3 and passes Lambda validation, upload it to Bunny Stream for transcoding. Handle the Bunny webhook when encoding completes.

### Steps

1. Create Bunny Stream video library (one-time, via Bunny dashboard — see setup checklist at bottom)

2. Add Bunny Stream env vars to API configuration

3. **`/api-creator`** — Create Bunny webhook endpoint following API conventions:
    - Create Zod request schema for Bunny webhook payload
    - Create Zod response schema
    - Create OpenAPIHono route with `createRoute()`
    - Create handler
    - Mount route in app
    - This is a **public endpoint** (no auth middleware — Bunny calls it)

4. Create Bunny Stream service module following `/api-code-review` conventions:
    - **Impure** functions (external API calls) go in `api/src/features/media/transcode/bunny.ts`
    - **Pure** functions (URL building, payload parsing) go in `api/src/features/media/transcode/functions/`
    - Service functions must be typed with explicit return types

5. Update existing S3 webhook handler (`api/src/features/media/webhook/index.ts`):
    - After validation success for `testimonial_video`, call `uploadToBunnyStream()`
    - Update media status to `processing`
    - Store Bunny GUID in `processing_metadata`

6. Create stuck-processing cron job (every 30 minutes)

### Files

```
api/src/features/media/
├── transcode/
│   ├── bunny.ts                             # NEW: Bunny Stream API calls (impure)
│   └── functions/
│       ├── buildBunnyUrls.ts                # NEW: URL construction (pure)
│       └── parseBunnyWebhook.ts             # NEW: Payload parsing/validation (pure)
├── bunny-webhook/
│   ├── index.ts                             # NEW: OpenAPIHono route + handler
│   └── schema.ts                            # NEW: Zod schemas for request/response
├── webhook/
│   └── index.ts                             # UPDATE: trigger Bunny upload after validation
└── cron/
    └── stuckProcessing.ts                   # NEW: Reconciliation cron
```

### Bunny Webhook Endpoint (following `/api-creator` patterns)

**Schema (`bunny-webhook/schema.ts`):**

```typescript
import { z } from '@hono/zod-openapi';

export const BunnyWebhookBodySchema = z
  .object({
    VideoGuid: z.string(),
    VideoLibraryId: z.number(),
    Status: z.number(),
    Length: z.number().optional(),
    Width: z.number().optional(),
    Height: z.number().optional(),
  })
  .openapi('BunnyWebhookBody');

export const BunnyWebhookResponseSchema = z
  .object({
    ok: z.boolean(),
  })
  .openapi('BunnyWebhookResponse');
```

**Route (`bunny-webhook/index.ts`):**

```typescript
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import { BunnyWebhookBodySchema, BunnyWebhookResponseSchema } from './schema';
import { parseBunnyWebhookStatus } from '../transcode/functions/parseBunnyWebhook';

const route = createRoute({
  method: 'post',
  path: '/media/webhooks/bunny-encoding',
  tags: ['Media'],
  summary: 'Bunny Stream encoding completion webhook',
  request: {
    body: {
      content: { 'application/json': { schema: BunnyWebhookBodySchema } },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: BunnyWebhookResponseSchema } },
      description: 'Webhook received',
    },
  },
});

export const bunnyWebhookApp = new OpenAPIHono();

bunnyWebhookApp.openapi(route, async (c) => {
  const payload = c.req.valid('json');
  const { VideoGuid, Status, Length } = payload;

  const media = await findMediaByBunnyGuid(VideoGuid);
  if (!media) {
    console.warn(`No media found for Bunny GUID: ${VideoGuid}`);
    return c.json({ ok: true });
  }

  const result = parseBunnyWebhookStatus(Status, VideoGuid, Length);

  if (result.status === 'ready') {
    await updateMedia(media.id, {
      status: 'ready',
      duration_seconds: result.duration,
      thumbnail_path: result.thumbnailUrl,
      processing_metadata: {
        ...media.processing_metadata,
        ...result.metadata,
      },
    });
  } else if (result.status === 'failed') {
    await updateMedia(media.id, {
      status: 'failed',
      processing_metadata: {
        ...media.processing_metadata,
        error: result.error,
        bunny_status: Status,
      },
    });
  }

  return c.json({ ok: true });
});
```

**Pure function (`transcode/functions/parseBunnyWebhook.ts`):**

```typescript
import { buildBunnyUrls } from './buildBunnyUrls';

interface BunnyReadyResult {
  status: 'ready';
  duration: number;
  thumbnailUrl: string;
  metadata: Record<string, unknown>;
}

interface BunnyFailedResult {
  status: 'failed';
  error: string;
}

interface BunnyIgnoredResult {
  status: 'ignored';
}

type BunnyWebhookResult = BunnyReadyResult | BunnyFailedResult | BunnyIgnoredResult;

/**
 * Parse Bunny Stream webhook status into our media update.
 * Pure function — no side effects.
 */
export function parseBunnyWebhookStatus(
  bunnyStatus: number,
  videoGuid: string,
  length?: number,
): BunnyWebhookResult {
  // Status 4 = Encoding finished
  if (bunnyStatus === 4) {
    const urls = buildBunnyUrls(videoGuid);
    return {
      status: 'ready',
      duration: length ?? 0,
      thumbnailUrl: urls.thumbnail,
      metadata: {
        playback_url: urls.mp4,
        hls_url: urls.hls,
        thumbnail_url: urls.thumbnail,
      },
    };
  }

  // Status 5 or 6 = Error
  if (bunnyStatus === 5 || bunnyStatus === 6) {
    return {
      status: 'failed',
      error: bunnyStatus === 5
        ? 'Bunny Stream encoding failed'
        : 'Bunny Stream upload failed',
    };
  }

  return { status: 'ignored' };
}
```

**Pure function (`transcode/functions/buildBunnyUrls.ts`):**

```typescript
const CDN_HOSTNAME = process.env.BUNNY_STREAM_CDN_HOSTNAME;

/**
 * Build Bunny Stream CDN URLs for a video.
 * Pure function — only string construction.
 */
export function buildBunnyUrls(videoGuid: string) {
  const base = `https://${CDN_HOSTNAME}/${videoGuid}`;
  return {
    mp4: `${base}/play_720p.mp4`,
    hls: `${base}/playlist.m3u8`,
    thumbnail: `${base}/thumbnail.jpg`,
  };
}
```

### Bunny Stream Service (`transcode/bunny.ts` — impure)

```typescript
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/shared/storage/s3';

const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID!;
const BUNNY_API_BASE = 'https://video.bunnycdn.com';

interface BunnyVideoResult {
  guid: string;
  libraryId: number;
}

/**
 * Create a video in Bunny Stream and upload the file from S3.
 * Impure — makes external API calls.
 */
export async function uploadToBunnyStream(params: {
  mediaId: string;
  orgId: string;
  s3Bucket: string;
  s3Key: string;
}): Promise<BunnyVideoResult> {
  const { mediaId, orgId, s3Bucket, s3Key } = params;

  // 1. Create video entry in Bunny
  const createRes = await fetch(
    `${BUNNY_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        AccessKey: BUNNY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: `${mediaId}_${orgId}` }),
    }
  );

  if (!createRes.ok) {
    throw new Error(`Bunny create video failed: ${createRes.status}`);
  }

  const { guid } = await createRes.json();

  // 2. Download from S3
  const s3Object = await s3Client.send(
    new GetObjectCommand({ Bucket: s3Bucket, Key: s3Key })
  );

  // 3. Upload to Bunny Stream
  const uploadRes = await fetch(
    `${BUNNY_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${guid}`,
    {
      method: 'PUT',
      headers: { AccessKey: BUNNY_API_KEY },
      body: s3Object.Body as ReadableStream,
    }
  );

  if (!uploadRes.ok) {
    throw new Error(`Bunny upload failed: ${uploadRes.status}`);
  }

  return { guid, libraryId: Number(BUNNY_LIBRARY_ID) };
}

/**
 * Query Bunny Stream for a video's current status.
 * Used by the stuck-processing cron.
 */
export async function getBunnyVideoStatus(videoGuid: string): Promise<number> {
  const res = await fetch(
    `${BUNNY_API_BASE}/library/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`,
    { headers: { AccessKey: BUNNY_API_KEY } }
  );

  if (!res.ok) return -1; // Not found
  const data = await res.json();
  return data.status;
}
```

### Bunny Encoding Status Codes

| Status | Meaning | Our Action |
|--------|---------|------------|
| 0 | Created | No action (waiting for upload) |
| 1 | Uploaded | No action (waiting for encoding) |
| 2 | Processing | No action (encoding in progress) |
| 3 | Transcoding | No action (encoding in progress) |
| **4** | **Finished** | **Update media: status=ready, store URLs** |
| **5** | **Error** | **Update media: status=failed** |
| 6 | UploadFailed | Update media: status=failed |

### Stuck Processing Cron (`cron/stuckProcessing.ts`)

```typescript
// Cron: every 30 minutes
// 1. Query media records: status='processing', entity_type='testimonial_video',
//    updated_at < NOW() - INTERVAL '30 minutes'
// 2. For each, read bunny_video_guid from processing_metadata
// 3. Call getBunnyVideoStatus(guid)
// 4. If Bunny status = 4 (finished) -> update media (missed webhook)
// 5. If Bunny status = 5/6 (error) -> set status='failed'
// 6. If still processing (0-3) -> skip (legitimate in-progress encoding)
// 7. If not found (-1) -> set status='failed' (orphaned)
```

### S3 Lifecycle Policy

**`/s3-management`** — After Phase 1 is stable, configure lifecycle rule to delete video originals after 30 days. Requires tagging video uploads with `entity-type: testimonial_video` in the presign flow.

### Commit Strategy

```
feat(api, ADR-029): add Bunny Stream upload service
feat(api, ADR-029): add Bunny encoding webhook endpoint
feat(api, ADR-029): trigger Bunny upload after video validation
feat(api, ADR-029): add stuck-processing reconciliation cron
```

### Pre-Commit Checklist

- [ ] **`/api-code-review`** — Verify feature folder structure, pure/impure separation
- [ ] **`/code-review`** — Review all staged changes

### Testing Checklist

- [ ] Upload H.264 MP4 -> Bunny encodes, webhook fires, media status = ready
- [ ] Upload iPhone HEVC .mov -> Bunny encodes to H.264, plays in Firefox
- [ ] Upload VP9 .webm -> Bunny encodes to H.264, plays in Safari
- [ ] Bunny playback URL works (direct MP4)
- [ ] Bunny HLS URL works (adaptive streaming)
- [ ] Bunny thumbnail URL loads
- [ ] Duration extracted correctly
- [ ] Bunny encoding failure -> media status = failed
- [ ] Upload to Bunny fails -> media status = failed, error stored
- [ ] Stuck processing cron catches missed webhooks
- [ ] S3 original file accessible for 30 days after upload
- [ ] Zod schema validates Bunny webhook payloads correctly
- [ ] Invalid webhook payloads return 200 (prevent Bunny retries)

---

## Phase 2: Video Delivery URLs

**Goal**: Frontend can resolve CDN URLs for videos and thumbnails from Bunny Stream.

### Steps

1. **`/graphql-code`** — Validate the updated `TestimonialBasic.gql` fragment (from Phase 0) against Hasura schema using tm-graph MCP tools

2. **`/graphql-code`** — Run codegen: `pnpm codegen:web`

3. Add video URL helper functions to `useMediaUrl` composable:
    - `getVideoUrl(media)` — direct MP4 URL from `processing_metadata.playback_url`
    - `getVideoHlsUrl(media)` — HLS URL from `processing_metadata.hls_url`
    - `getVideoThumbnailUrl(media)` — thumbnail URL from `thumbnail_path`

4. Export new functions from media entity barrel:
    - Types MUST be exported from `models/` folder only (FSD rule)
    - Functions exported from composables barrel

### Files

```
apps/web/src/entities/media/
├── composables/
│   └── useMediaUrl.ts                       # UPDATE: add getVideoUrl, getVideoHlsUrl, getVideoThumbnailUrl
├── models/
│   └── index.ts                             # UPDATE: add VideoMediaRecord type if needed
└── index.ts                                 # UPDATE: re-export new functions
```

### URL Resolution Logic

```typescript
// In useMediaUrl.ts
// These are non-reactive utility functions (not composables)
// following the existing pattern of getMediaUrl(), getThumbnailUrl(), etc.

/**
 * Get direct MP4 playback URL for a video (dashboard use).
 * Returns null if media is not ready.
 */
export function getVideoUrl(media: MediaRecord): string | null {
  if (media.status !== 'ready') return null;
  const metadata = media.processing_metadata as Record<string, unknown> | null;
  return (metadata?.playback_url as string) ?? null;
}

/**
 * Get HLS URL for adaptive streaming (widget embed use).
 * Returns null if media is not ready.
 */
export function getVideoHlsUrl(media: MediaRecord): string | null {
  if (media.status !== 'ready') return null;
  const metadata = media.processing_metadata as Record<string, unknown> | null;
  return (metadata?.hls_url as string) ?? null;
}

/**
 * Get thumbnail URL for the video.
 * Unlike image thumbnails, video thumbnails come from Bunny CDN (not ImageKit).
 * Returns null if no thumbnail available.
 */
export function getVideoThumbnailUrl(media: MediaRecord): string | null {
  return media.thumbnail_path ?? null;
}
```

> **FSD Note**: These are non-reactive utility functions (like the existing `getMediaUrl()`, `getThumbnailUrl()`, etc.), NOT Vue composables. They don't use `ref()` or `computed()`. They follow the existing pattern in `useMediaUrl.ts`.

### Commit

```
feat(web, ADR-029): add video URL resolution helpers for Bunny Stream
```

### Testing Checklist

- [ ] `getVideoUrl()` returns Bunny MP4 URL for ready videos
- [ ] `getVideoUrl()` returns `null` when status is not `ready`
- [ ] `getVideoHlsUrl()` returns Bunny HLS URL
- [ ] `getVideoThumbnailUrl()` returns Bunny thumbnail URL
- [ ] GraphQL fragment includes video_media fields
- [ ] Codegen produces correct TypeScript types
- [ ] `pnpm typecheck` passes
- [ ] Types exported from models/ folder (FSD rule)

---

## Phase 3: Dashboard Video Playback

**Goal**: Video testimonials are viewable in the admin dashboard with native browser player.

### Steps

1. **`/e2e-test-ids`** — Create test IDs for video UI elements:

    ```typescript
    // In apps/web/src/shared/constants/testIds/testimonials.ts (or new video.ts)
    export const VIDEO_TEST_IDS = {
      player: 'video-player',
      processingState: 'video-processing-state',
      failedState: 'video-failed-state',
      typeIndicator: 'testimonial-type-indicator',
      durationLabel: 'video-duration-label',
    } as const;
    ```

2. Create `VideoPlayer.vue` in `apps/web/src/entities/media/components/`:
    - Thin wrapper around native `<video>` with mandatory attributes (`playsinline`, `preload`, `poster`, `crossorigin`)
    - Add `data-testid` from test IDs
    - Must stay under 250 lines (component limit)

3. Create `formatDuration` utility:
    - Place in `apps/web/src/shared/lib/formatDuration.ts` (shared utility, not entity-specific)
    - Export from shared lib barrel

4. Update `TestimonialDetailPanel.vue`:
    - Conditional rendering based on `testimonial.type`
    - `'video'` -> show `VideoPlayer` with playback URL and poster
    - Handle `processing` and `failed` states
    - Add `data-testid` attributes

5. Update `TestimonialsTableRow.vue`:
    - Show video icon + duration for `type === 'video'`
    - Keep existing text truncation for `type === 'text'`
    - Add `data-testid` for type indicator

6. **`/e2e-tests-creator`** — Create E2E test for video testimonial display:
    - Journey test: submit video testimonial -> approve -> verify playback in dashboard
    - Focused test: video processing states (processing, failed, ready)

### Files

```
apps/web/src/shared/
├── constants/testIds/
│   └── video.ts                             # NEW: video test IDs
├── lib/
│   └── formatDuration.ts                    # NEW: duration formatting utility
apps/web/src/entities/media/components/
└── VideoPlayer.vue                          # NEW: native <video> wrapper
apps/web/src/features/testimonialsList/ui/
├── TestimonialDetailPanel.vue               # UPDATE: video playback
└── TestimonialsTableRow.vue                 # UPDATE: video indicator
apps/web/e2e/
└── tests/testimonials/
    └── video-testimonial-display.spec.ts    # NEW: E2E test
```

### VideoPlayer.vue Component

```vue
<script setup lang="ts">
import { VIDEO_TEST_IDS } from '@/shared/constants/testIds/video';

interface Props {
  src: string;
  poster?: string;
  class?: string;
}

defineProps<Props>();
</script>

<template>
  <video
    :src="src"
    :poster="poster"
    controls
    playsinline
    preload="metadata"
    crossorigin="anonymous"
    :class="['w-full rounded-lg', $props.class]"
    :data-testid="VIDEO_TEST_IDS.player"
  >
    Your browser does not support video playback.
  </video>
</template>
```

### formatDuration Utility (`shared/lib/formatDuration.ts`)

```typescript
/** Format seconds into M:SS or H:MM:SS */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
```

### Commit Strategy

```
feat(web, ADR-029): add video player component and test IDs
feat(web, ADR-029): add video playback to testimonial detail panel
feat(web, ADR-029): add video indicator to testimonials table row
test(e2e, ADR-029): add video testimonial display tests
```

### Pre-Commit Checklist

- [ ] **`/code-review`** — Review staged frontend changes
- [ ] **`/e2e-tests-runner`** — Run video-related E2E tests
- [ ] **`/code-review-e2e-runner`** — Map changes to relevant tests and run

### Testing Checklist

- [ ] Video testimonials show video icon + duration in table row
- [ ] Text testimonials render unchanged
- [ ] Clicking a video testimonial row shows native `<video>` player in detail panel
- [ ] Poster thumbnail loads from Bunny CDN before play
- [ ] Video plays from Bunny CDN (direct MP4 URL)
- [ ] `playsinline` works on iOS (no fullscreen takeover)
- [ ] Processing state shows spinner with message (with `data-testid`)
- [ ] Failed state shows error message (with `data-testid`)
- [ ] Duration formats correctly (e.g., "1:45", "12:03")
- [ ] All test IDs present and queryable in E2E tests
- [ ] Components under 250 line limit
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes

---

## Phase 4: Widget Video Player (with Widget Embed)

**Goal**: Video testimonials render in embeddable widgets with a branded Vidstack player using HLS adaptive streaming.

**Dependency**: This phase ships alongside widget embed implementation (ADR-024).

### Steps

1. Add Vidstack Player dependency to widget embed package: `pnpm add vidstack --filter widget-embed`

2. Create `VideoCard` component with poster + play button overlay

3. Create `VideoOverlay` component (play button, loading state)

4. Implement click-to-play behavior (no autoplay by default)

5. Use HLS URL from Bunny Stream for adaptive bitrate streaming:
    - Primary source: HLS manifest (`playlist.m3u8`)
    - Fallback: direct MP4 (`play_720p.mp4`)
    - Vidstack handles hls.js internally for non-Safari browsers

6. Optional muted autoplay for single spotlight widgets (configurable per widget)

7. Lazy-load Vidstack only when a video card enters viewport (IntersectionObserver)

8. **`/e2e-tests-creator`** — Create E2E tests for widget video playback

### Files

```
packages/widget-embed/
├── package.json                             # UPDATE: add vidstack dependency
└── src/components/
    ├── VideoCard.ts                         # NEW: Vidstack-based video card
    └── VideoOverlay.ts                      # NEW: play button overlay
```

### Vidstack + Bunny HLS Integration

```typescript
// VideoCard.ts — Widget embed video card with adaptive streaming
import { VidstackPlayer, VidstackPlayerLayout } from 'vidstack/global/player';

interface VideoCardOptions {
  container: HTMLElement;
  hlsUrl: string;      // Bunny HLS: https://vz-xxx.b-cdn.net/{guid}/playlist.m3u8
  mp4Url: string;      // Bunny MP4:  https://vz-xxx.b-cdn.net/{guid}/play_720p.mp4
  thumbnailUrl: string; // Bunny thumb: https://vz-xxx.b-cdn.net/{guid}/thumbnail.jpg
  autoplay?: boolean;   // Only for single spotlight widgets
}

export async function createVideoCard(options: VideoCardOptions) {
  const { container, hlsUrl, mp4Url, thumbnailUrl, autoplay = false } = options;

  const player = await VidstackPlayer.create({
    target: container,
    src: [
      { src: hlsUrl, type: 'application/x-mpegurl' },
      { src: mp4Url, type: 'video/mp4' },
    ],
    poster: thumbnailUrl,
    playsinline: true,
    ...(autoplay && { autoplay: true, muted: true, loop: true }),
    layout: new VidstackPlayerLayout({
      // Minimal controls: play/pause, progress, volume, fullscreen
      // Hide: download, PiP, playback speed, captions
    }),
  });

  return player;
}
```

### Lazy Loading Strategy

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(async (entry) => {
    if (entry.isIntersecting) {
      const { createVideoCard } = await import('./VideoCard');
      await createVideoCard({
        container: entry.target as HTMLElement,
        hlsUrl: entry.target.dataset.hlsUrl!,
        mp4Url: entry.target.dataset.mp4Url!,
        thumbnailUrl: entry.target.dataset.thumbnailUrl!,
      });
      observer.unobserve(entry.target);
    }
  });
}, { rootMargin: '200px' });
```

### Widget Types — Video Card Variants

| Widget Type | Video Behavior | Autoplay | Streaming |
|-------------|---------------|----------|-----------|
| **Wall of Love** | Poster + play overlay in masonry card | No | HLS (on play) |
| **Carousel** | Poster + play overlay, one visible at a time | No | HLS (on play) |
| **Single Spotlight** | Full player, optional muted autoplay | Configurable | HLS |

### Commit Strategy

```
feat(widget, ADR-029): add Vidstack video player to widget embed
feat(widget, ADR-029): add lazy loading for video cards
test(e2e, ADR-029): add widget video playback tests
```

### Testing Checklist

- [ ] Wall of Love: video cards show poster + play overlay
- [ ] Carousel: video cards show poster + play overlay
- [ ] Single Spotlight: plays muted when autoplay enabled
- [ ] Click play -> video plays with sound via HLS
- [ ] HLS adaptive streaming adjusts quality on slow connections
- [ ] MP4 fallback works when HLS fails
- [ ] Vidstack lazy-loads on scroll (check network tab)
- [ ] Mobile iOS: plays inline, no fullscreen takeover
- [ ] Mobile Android: plays inline
- [ ] Player controls match branded widget styling
- [ ] Multiple video cards on same page don't conflict
- [ ] Widget embed script size stays reasonable (Vidstack treeshaken)

---

## Deployment Order

```
Phase 0 (Database Schema)         <- ADR-026 prerequisites
    |
    v
Phase 1 (Bunny Stream Integration)
    |
    v
Phase 2 (Video Delivery URLs)
    |
    v
Phase 3 (Dashboard Video Playback)
    |
    v
Phase 4 (Widget Video Player)     <- Ships with ADR-024 widget embed
```

Phases 0-3 can ship incrementally. Phase 4 depends on the widget embed infrastructure from ADR-024.

---

## Bunny Stream Setup Checklist (One-Time)

- [ ] Create Bunny account at bunny.net
- [ ] Create a Video Library in Bunny dashboard
- [ ] Note Library ID and API Key
- [ ] Configure webhook URL in Bunny dashboard: `POST {API_BASE_URL}/media/webhooks/bunny-encoding`
- [ ] Configure allowed origins for embed/playback (CORS)
- [ ] Add environment variables to API deployment (dev, staging, prod)
- [ ] Test upload via Bunny API manually to verify integration
- [ ] **`/s3-management`** — Verify S3 bucket access for video downloads

---

## Cross-Phase Standards

### Commit Convention
All commits reference ADR-029 using the project's modified Conventional Commits format:
```
type(scope, ADR-029): description
```
Use **`/create-commits`** skill for each commit.

### Code Review
Before merging each phase, run:
- **`/code-review`** — General staged changes review
- **`/api-code-review`** — For API changes (Phases 0, 1)
- **`/e2e-code-review`** — For E2E test files (Phases 3, 4)
- **`/code-review-e2e-runner`** — Map changes to relevant tests

### GraphQL Operations
When modifying `.gql` files (Phases 0, 2), use **`/graphql-code`** to:
1. Validate operations against Hasura schema (tm-graph MCP)
2. Run codegen (`pnpm codegen:web`)
3. Verify generated types compile
4. Export types from `models/` folders (FSD rule)

### Testing
- Use **`/e2e-test-ids`** before creating UI (Phase 3) — test IDs first, then components
- Use **`/e2e-tests-creator`** for new test files — follow journey vs focused conventions
- Use **`/e2e-tests-runner`** to execute tests — correct port for worktree
