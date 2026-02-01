import { wrapUserContent } from '@/shared/utils/inputSanitizer';
import type { AssembleTestimonialRequest } from '@/shared/schemas/ai';

/**
 * Build the user message with customer answers for AI testimonial assembly.
 *
 * Wraps user content in XML tags to clearly delineate untrusted content
 * and prevent prompt injection attacks.
 */
export function buildUserMessage(
  productName: string,
  answers: AssembleTestimonialRequest['answers'],
  rating?: number,
  modification?: AssembleTestimonialRequest['modification']
): string {
  const answerBlocks = answers
    .map(
      (a) =>
        `<question key="${a.question_key}">${a.question_text}</question>\n<answer>${a.answer}</answer>`
    )
    .join('\n\n');

  let message = `Transform these customer responses into a testimonial for ${wrapUserContent(productName, 'product_name')}:

<customer_responses>
${answerBlocks}
</customer_responses>`;

  if (rating) {
    message += `\n\n<rating>${rating}/5 stars</rating>`;
  }

  if (modification) {
    message += `\n\n<modification_request>
Apply this modification to improve the testimonial:
Suggestion: ${modification.suggestion_id}
Previous testimonial: ${modification.previous_testimonial}
</modification_request>`;
  }

  return message;
}
