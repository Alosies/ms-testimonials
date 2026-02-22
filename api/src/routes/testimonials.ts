import { Hono } from 'hono';
import { SubmitFormRequestSchema, submitForm } from '@/features/submissions';

const testimonials = new Hono();

/**
 * GET /testimonials
 * Get all testimonials for a user
 */
testimonials.get('/', async (c) => {
  // TODO: Implement get testimonials
  return c.json({ testimonials: [] });
});

/**
 * POST /testimonials
 * Submit a new testimonial (public endpoint for customers)
 *
 * ADR-025: Form submission persistence via Drizzle transaction.
 * Creates contact, form_submission, question_responses, and testimonial atomically.
 */
testimonials.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON body' }, 400);
  }

  const parsed = SubmitFormRequestSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { success: false, message: 'Invalid request', errors: parsed.error.flatten().fieldErrors },
      400,
    );
  }

  try {
    const result = await submitForm(parsed.data);

    return c.json({
      success: true,
      submissionId: result.submissionId,
      testimonialId: result.testimonialId,
    });
  } catch (error) {
    console.error('Form submission failed:', error);
    return c.json(
      { success: false, message: 'Submission failed. Please try again.' },
      500,
    );
  }
});

/**
 * PUT /testimonials/:id/approve
 * Approve a testimonial
 */
testimonials.put('/:id/approve', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement approval
  return c.json({ message: `Testimonial ${id} approved` });
});

/**
 * PUT /testimonials/:id/reject
 * Reject a testimonial
 */
testimonials.put('/:id/reject', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement rejection
  return c.json({ message: `Testimonial ${id} rejected` });
});

/**
 * DELETE /testimonials/:id
 * Delete a testimonial
 */
testimonials.delete('/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Implement deletion
  return c.json({ message: `Testimonial ${id} deleted` });
});

export default testimonials;
