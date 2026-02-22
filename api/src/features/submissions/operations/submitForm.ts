/**
 * Submit Form Operation
 *
 * Persists a form submission as a Drizzle transaction:
 * 1. Upsert contact (ON CONFLICT update)
 * 2. Insert form_submission
 * 3. Batch insert form_question_responses
 * 4. Insert testimonial (if content or rating provided)
 *
 * ADR Reference: ADR-025 Testimonials Display (Phase 5a)
 */

import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import type { SubmitFormRequest } from '../schemas';
import type { ContactRow, SubmissionRow, TestimonialRow, SubmitFormResult } from '../types';

/**
 * Submit a form and persist all related records atomically.
 *
 * @param params - Validated submission request
 * @returns IDs of created records
 */
export async function submitForm(params: SubmitFormRequest): Promise<SubmitFormResult> {
  const {
    formId,
    organizationId,
    contact,
    consentType,
    questionResponses,
    testimonialContent,
    rating,
  } = params;

  const db = getDb();

  return db.transaction(async (tx) => {
    // Step 1: Upsert contact
    const contactResult = await tx.execute<ContactRow>(sql`
      INSERT INTO contacts (
        organization_id,
        email,
        name,
        job_title,
        company_name,
        linkedin_url,
        twitter_url,
        avatar_url,
        source,
        source_form_id
      )
      VALUES (
        ${organizationId},
        ${contact.email},
        ${contact.name ?? null},
        ${contact.jobTitle ?? null},
        ${contact.companyName ?? null},
        ${contact.linkedinUrl ?? null},
        ${contact.twitterUrl ?? null},
        ${contact.avatarUrl ?? null},
        'form_submission',
        ${formId}
      )
      ON CONFLICT (organization_id, email)
      DO UPDATE SET
        name = COALESCE(EXCLUDED.name, contacts.name),
        job_title = COALESCE(EXCLUDED.job_title, contacts.job_title),
        company_name = COALESCE(EXCLUDED.company_name, contacts.company_name),
        linkedin_url = COALESCE(EXCLUDED.linkedin_url, contacts.linkedin_url),
        twitter_url = COALESCE(EXCLUDED.twitter_url, contacts.twitter_url),
        avatar_url = COALESCE(EXCLUDED.avatar_url, contacts.avatar_url),
        submission_count = contacts.submission_count + 1,
        last_seen_at = NOW(),
        updated_at = NOW()
      RETURNING id
    `);

    const contactRow = contactResult[0];
    if (!contactRow) throw new Error('Failed to upsert contact');
    const contactId = contactRow.id;

    // Step 2: Insert form_submission
    const submissionResult = await tx.execute<SubmissionRow>(sql`
      INSERT INTO form_submissions (
        organization_id,
        form_id,
        contact_id,
        submitted_at
      )
      VALUES (
        ${organizationId},
        ${formId},
        ${contactId},
        NOW()
      )
      RETURNING id
    `);

    const submissionRow = submissionResult[0];
    if (!submissionRow) throw new Error('Failed to insert form submission');
    const submissionId = submissionRow.id;

    // Step 3: Batch insert form_question_responses
    if (questionResponses.length > 0) {
      const values = questionResponses.map((qr) => sql`(
        ${organizationId},
        ${submissionId},
        ${qr.questionId},
        ${qr.answerText ?? null},
        ${qr.answerInteger ?? null},
        ${qr.answerBoolean ?? null},
        ${qr.answerJson ? JSON.stringify(qr.answerJson) : null}::jsonb,
        ${qr.answerUrl ?? null}
      )`);

      await tx.execute(sql`
        INSERT INTO form_question_responses (
          organization_id,
          submission_id,
          question_id,
          answer_text,
          answer_integer,
          answer_boolean,
          answer_json,
          answer_url
        )
        VALUES ${sql.join(values, sql`, `)}
      `);
    }

    // Step 4: Insert testimonial (if content or rating provided)
    let testimonialId: string | null = null;

    if (testimonialContent || rating) {
      const testimonialResult = await tx.execute<TestimonialRow>(sql`
        INSERT INTO testimonials (
          organization_id,
          submission_id,
          status,
          content,
          rating,
          customer_name,
          customer_email,
          customer_title,
          customer_company,
          customer_avatar_url,
          customer_linkedin_url,
          customer_twitter_url,
          source
        )
        VALUES (
          ${organizationId},
          ${submissionId},
          'pending',
          ${testimonialContent ?? null},
          ${rating ?? null},
          ${contact.name ?? contact.email},
          ${contact.email},
          ${contact.jobTitle ?? null},
          ${contact.companyName ?? null},
          ${contact.avatarUrl ?? null},
          ${contact.linkedinUrl ?? null},
          ${contact.twitterUrl ?? null},
          'form'
        )
        RETURNING id
      `);

      const testimonialRow = testimonialResult[0];
      if (!testimonialRow) throw new Error('Failed to insert testimonial');
      testimonialId = testimonialRow.id;
    }

    return {
      submissionId,
      testimonialId,
      contactId,
    };
  });
}
