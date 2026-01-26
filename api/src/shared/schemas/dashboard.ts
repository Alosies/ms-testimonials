/**
 * Form Dashboard Zod Schemas
 *
 * Defines request/response schemas for the dashboard API endpoint.
 * Types are inferred from schemas and exported for frontend consumption.
 */

import { z } from '@hono/zod-openapi';

// ============================================================
// Enums & Constants
// ============================================================

/**
 * Time period for dashboard queries
 */
export const PeriodSchema = z.enum(['7d', '30d', '90d']).openapi({
  description: 'Time period for dashboard data',
  example: '30d',
});

/**
 * Metric sentiment based on benchmark comparison
 */
export const MetricSentimentSchema = z.enum(['positive', 'negative', 'neutral']).openapi({
  description: 'Whether the metric is above, below, or at the expected benchmark',
  example: 'positive',
});

// ============================================================
// Session Stats
// ============================================================

/**
 * Key metrics with optional benchmark comparison
 */
export const MetricWithBenchmarkSchema = z.object({
  value: z.number().nullable().openapi({
    description: 'The metric value (null if no data)',
    example: 68.4,
  }),
  benchmark: z.number().nullable().openapi({
    description: 'Expected value based on form structure (null if not applicable)',
    example: 58.0,
  }),
  sentiment: MetricSentimentSchema.nullable().openapi({
    description: 'Performance relative to benchmark',
  }),
  diff: z.string().nullable().openapi({
    description: 'Human-readable difference from benchmark',
    example: '↑ 18% above expected',
  }),
}).openapi('MetricWithBenchmark');

/**
 * Session statistics for the dashboard
 */
export const SessionStatsSchema = z.object({
  totalSessions: z.number().int().openapi({
    description: 'Total number of unique sessions',
    example: 247,
  }),
  completedSessions: z.number().int().openapi({
    description: 'Sessions that submitted the form',
    example: 169,
  }),
  abandonedSessions: z.number().int().openapi({
    description: 'Sessions that abandoned the form',
    example: 60,
  }),
  completionRate: MetricWithBenchmarkSchema.openapi({
    description: 'Completion rate with benchmark comparison',
  }),
  abandonmentRate: MetricWithBenchmarkSchema.openapi({
    description: 'Abandonment rate with benchmark comparison',
  }),
  avgCompletionTimeMs: z.number().nullable().openapi({
    description: 'Average time to complete the form in milliseconds (null if no completions)',
    example: 154000,
  }),
  avgCompletionTimeBenchmark: MetricWithBenchmarkSchema.nullable().openapi({
    description: 'Completion time with benchmark comparison',
  }),
}).openapi('SessionStats');

// ============================================================
// Funnel Data
// ============================================================

/**
 * Single step in the conversion funnel
 */
export const FunnelStepSchema = z.object({
  stepIndex: z.number().int().openapi({
    description: 'Zero-based step index',
    example: 0,
  }),
  stepType: z.string().openapi({
    description: 'Type of step (welcome, question, rating, etc.)',
    example: 'welcome',
  }),
  stepId: z.string().nullable().openapi({
    description: 'ID of the step',
    example: 'step_abc123',
  }),
  sessions: z.number().int().openapi({
    description: 'Number of sessions that reached this step',
    example: 247,
  }),
  percentage: z.number().openapi({
    description: 'Percentage of total sessions that reached this step',
    example: 100,
  }),
  dropoffPercent: z.number().nullable().openapi({
    description: 'Percentage drop from previous step (null for first step)',
    example: 8.1,
  }),
}).openapi('FunnelStep');

/**
 * Complete funnel data
 */
export const FunnelDataSchema = z.object({
  steps: z.array(FunnelStepSchema).openapi({
    description: 'Ordered list of funnel steps',
  }),
  highestDropoffStep: z.object({
    stepIndex: z.number().int(),
    stepType: z.string(),
    dropoffPercent: z.number(),
  }).nullable().openapi({
    description: 'Step with the highest drop-off rate',
  }),
}).openapi('FunnelData');

// ============================================================
// Audience Data
// ============================================================

/**
 * Device breakdown
 */
export const DeviceBreakdownSchema = z.object({
  desktop: z.number().int().openapi({
    description: 'Number of desktop sessions',
    example: 178,
  }),
  mobile: z.number().int().openapi({
    description: 'Number of mobile sessions',
    example: 69,
  }),
  desktopPercent: z.number().openapi({
    description: 'Percentage of desktop sessions',
    example: 72.1,
  }),
  mobilePercent: z.number().openapi({
    description: 'Percentage of mobile sessions',
    example: 27.9,
  }),
}).openapi('DeviceBreakdown');

/**
 * Country entry in location breakdown
 */
export const CountryEntrySchema = z.object({
  country: z.string().openapi({
    description: 'Country name',
    example: 'United States',
  }),
  countryCode: z.string().nullable().openapi({
    description: 'ISO country code',
    example: 'US',
  }),
  sessions: z.number().int().openapi({
    description: 'Number of sessions from this country',
    example: 104,
  }),
  percent: z.number().openapi({
    description: 'Percentage of total sessions',
    example: 42.1,
  }),
}).openapi('CountryEntry');

/**
 * Complete audience data
 */
export const AudienceDataSchema = z.object({
  device: DeviceBreakdownSchema,
  topCountries: z.array(CountryEntrySchema).openapi({
    description: 'Top 5 countries by session count',
  }),
  otherCountriesPercent: z.number().openapi({
    description: 'Percentage of sessions from countries not in top 5',
    example: 20.0,
  }),
}).openapi('AudienceData');

// ============================================================
// Rating Data
// ============================================================

/**
 * Rating distribution entry
 */
export const RatingDistributionEntrySchema = z.object({
  rating: z.number().int().min(1).max(5).openapi({
    description: 'Star rating (1-5)',
    example: 5,
  }),
  count: z.number().int().openapi({
    description: 'Number of responses with this rating',
    example: 105,
  }),
  percent: z.number().openapi({
    description: 'Percentage of total ratings',
    example: 62.1,
  }),
}).openapi('RatingDistributionEntry');

/**
 * Complete rating data
 */
export const RatingDataSchema = z.object({
  avgRating: z.number().nullable().openapi({
    description: 'Average rating (null if no ratings)',
    example: 4.2,
  }),
  totalRatings: z.number().int().openapi({
    description: 'Total number of ratings',
    example: 169,
  }),
  distribution: z.array(RatingDistributionEntrySchema).openapi({
    description: 'Distribution of ratings (5 entries, one per star)',
  }),
  hasRatingStep: z.boolean().openapi({
    description: 'Whether the form has a rating step',
    example: true,
  }),
}).openapi('RatingData');

// ============================================================
// Dashboard Response
// ============================================================

/**
 * Benchmark metadata
 */
export const BenchmarkMetadataSchema = z.object({
  expectedCompletionRate: z.number().openapi({
    description: 'Expected completion rate based on form structure',
    example: 58.0,
  }),
  complexityScore: z.number().openapi({
    description: 'Total complexity score of form steps',
    example: 3.2,
  }),
  stepCount: z.number().int().openapi({
    description: 'Number of steps in the form',
    example: 5,
  }),
}).openapi('BenchmarkMetadata');

/**
 * Data availability metadata
 */
export const DataAvailabilitySchema = z.object({
  hasData: z.boolean().openapi({
    description: 'Whether any analytics data exists',
    example: true,
  }),
  sessionCount: z.number().int().openapi({
    description: 'Total sessions in the period',
    example: 247,
  }),
  isStatisticallySignificant: z.boolean().openapi({
    description: 'Whether sample size is >= 5 for meaningful stats',
    example: true,
  }),
  caveat: z.string().nullable().openapi({
    description: 'Warning message for small sample sizes',
    example: null,
  }),
}).openapi('DataAvailability');

/**
 * Complete dashboard response
 */
export const DashboardResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    formId: z.string().openapi({
      description: 'ID of the form',
      example: 'form_abc123',
    }),
    period: PeriodSchema,
    periodDays: z.number().int().openapi({
      description: 'Number of days in the selected period',
      example: 30,
    }),
    availability: DataAvailabilitySchema,
    stats: SessionStatsSchema,
    funnel: FunnelDataSchema,
    audience: AudienceDataSchema,
    ratings: RatingDataSchema,
    benchmark: BenchmarkMetadataSchema,
    generatedAt: z.string().datetime().openapi({
      description: 'When the dashboard data was generated',
      example: '2026-01-25T10:30:00Z',
    }),
  }),
}).openapi('DashboardResponse');

/**
 * Dashboard error response
 */
export const DashboardErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string().openapi({
    description: 'Error message',
    example: 'Form not found',
  }),
}).openapi('DashboardErrorResponse');

// ============================================================
// Type Exports
// ============================================================

export type Period = z.infer<typeof PeriodSchema>;
export type MetricSentiment = z.infer<typeof MetricSentimentSchema>;
export type MetricWithBenchmark = z.infer<typeof MetricWithBenchmarkSchema>;
export type SessionStats = z.infer<typeof SessionStatsSchema>;
export type FunnelStep = z.infer<typeof FunnelStepSchema>;
export type FunnelData = z.infer<typeof FunnelDataSchema>;
export type DeviceBreakdown = z.infer<typeof DeviceBreakdownSchema>;
export type CountryEntry = z.infer<typeof CountryEntrySchema>;
export type AudienceData = z.infer<typeof AudienceDataSchema>;
export type RatingDistributionEntry = z.infer<typeof RatingDistributionEntrySchema>;
export type RatingData = z.infer<typeof RatingDataSchema>;
export type BenchmarkMetadata = z.infer<typeof BenchmarkMetadataSchema>;
export type DataAvailability = z.infer<typeof DataAvailabilitySchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type DashboardErrorResponse = z.infer<typeof DashboardErrorResponseSchema>;
