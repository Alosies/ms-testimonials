/**
 * Rating Data Query
 *
 * Calculates rating statistics from form_question_responses table.
 * Ratings are stored in answer_integer column for rating-type steps.
 * CRITICAL: All queries include organizationId for tenant isolation.
 */

import { sql } from 'drizzle-orm';
import type { DrizzleClient } from '@/db';
import type { RatingData, RatingDistributionEntry } from '@/shared/schemas/dashboard';
import { safePercentage } from '../utils/formatMetrics';

/**
 * Get rating data from form question responses
 *
 * @param db - Drizzle database client
 * @param formId - ID of the form
 * @param organizationId - Organization ID for tenant isolation (REQUIRED)
 * @param since - Start date for the query period
 * @param hasRatingStep - Whether the form has a rating step
 * @returns Rating data with distribution
 */
export async function getRatingData(
  db: DrizzleClient,
  formId: string,
  organizationId: string,
  since: Date,
  hasRatingStep: boolean
): Promise<RatingData> {
  // If the form doesn't have a rating step, return empty data
  if (!hasRatingStep) {
    return {
      avgRating: null,
      totalRatings: 0,
      distribution: [],
      hasRatingStep: false,
    };
  }

  // Query form_question_responses for rating data
  // Join through form_submissions and form_steps to identify rating responses
  const result = await db.execute<{
    avg_rating: string | null;
    total_ratings: string;
    five_star: string;
    four_star: string;
    three_star: string;
    two_star: string;
    one_star: string;
  }>(sql`
    SELECT
      ROUND(AVG(fqr.answer_integer)::numeric, 1) as avg_rating,
      COUNT(*)::int as total_ratings,
      COUNT(*) FILTER (WHERE fqr.answer_integer = 5)::int as five_star,
      COUNT(*) FILTER (WHERE fqr.answer_integer = 4)::int as four_star,
      COUNT(*) FILTER (WHERE fqr.answer_integer = 3)::int as three_star,
      COUNT(*) FILTER (WHERE fqr.answer_integer = 2)::int as two_star,
      COUNT(*) FILTER (WHERE fqr.answer_integer = 1)::int as one_star
    FROM form_question_responses fqr
    INNER JOIN form_submissions fs ON fqr.submission_id = fs.id
    INNER JOIN form_questions fq ON fqr.question_id = fq.id
    INNER JOIN form_steps fst ON fq.step_id = fst.id
      AND fst.step_type = 'rating'
    WHERE fs.form_id = ${formId}
      AND fqr.organization_id = ${organizationId}
      AND fqr.answer_integer IS NOT NULL
      AND fqr.answer_integer BETWEEN 1 AND 5
      AND fs.submitted_at >= ${since.toISOString()}
  `);

  const row = result[0];

  if (!row) {
    return {
      avgRating: null,
      totalRatings: 0,
      distribution: [],
      hasRatingStep: true,
    };
  }

  const totalRatings = parseInt(row.total_ratings as string) || 0;

  if (totalRatings === 0) {
    return {
      avgRating: null,
      totalRatings: 0,
      distribution: [],
      hasRatingStep: true,
    };
  }

  const avgRating = row.avg_rating ? parseFloat(row.avg_rating as string) : null;

  // Build distribution array (5 stars to 1 star)
  const distribution: RatingDistributionEntry[] = [
    {
      rating: 5,
      count: parseInt(row.five_star as string) || 0,
      percent: safePercentage(parseInt(row.five_star as string) || 0, totalRatings) ?? 0,
    },
    {
      rating: 4,
      count: parseInt(row.four_star as string) || 0,
      percent: safePercentage(parseInt(row.four_star as string) || 0, totalRatings) ?? 0,
    },
    {
      rating: 3,
      count: parseInt(row.three_star as string) || 0,
      percent: safePercentage(parseInt(row.three_star as string) || 0, totalRatings) ?? 0,
    },
    {
      rating: 2,
      count: parseInt(row.two_star as string) || 0,
      percent: safePercentage(parseInt(row.two_star as string) || 0, totalRatings) ?? 0,
    },
    {
      rating: 1,
      count: parseInt(row.one_star as string) || 0,
      percent: safePercentage(parseInt(row.one_star as string) || 0, totalRatings) ?? 0,
    },
  ];

  return {
    avgRating,
    totalRatings,
    distribution,
    hasRatingStep: true,
  };
}
