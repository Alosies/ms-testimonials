import type { FormStep } from '@/shared/stepCards';
import type { SubmitFormRequest } from '@/shared/api/submissions';

/**
 * Build the submission payload by iterating visible steps and extracting
 * data by step type from the responses map.
 *
 * Pure function — no side effects or reactive dependencies.
 */
export function buildSubmissionPayload(
  visibleSteps: FormStep[],
  responses: Record<string, unknown>,
  formId: string,
  organizationId: string,
): SubmitFormRequest {
  let contact: SubmitFormRequest['contact'] = { email: '' };
  let consentType: 'public' | 'private' | undefined;
  const questionResponses: SubmitFormRequest['questionResponses'] = [];
  let testimonialContent: string | undefined;
  let rating: number | undefined;

  for (const step of visibleSteps) {
    const value = responses[step.id];
    if (value === undefined || value === null) continue;

    switch (step.stepType) {
      case 'contact_info': {
        const contactData = value as Record<string, string>;
        contact = {
          email: contactData.email ?? '',
          name: contactData.name,
          jobTitle: contactData.jobTitle,
          companyName: contactData.company,
          linkedinUrl: contactData.linkedin,
          twitterUrl: contactData.twitter,
        };
        break;
      }
      case 'consent': {
        consentType = value as 'public' | 'private';
        break;
      }
      case 'rating': {
        if (typeof value === 'number') {
          rating = value;
          if (step.question?.id) {
            questionResponses.push({ questionId: step.question.id, answerInteger: value });
          }
        }
        break;
      }
      case 'question': {
        if (typeof value === 'string' && step.question?.id) {
          questionResponses.push({ questionId: step.question.id, answerText: value });
        }
        break;
      }
      case 'testimonial_write': {
        if (typeof value === 'string') {
          testimonialContent = value;
        }
        break;
      }
    }
  }

  return {
    formId,
    organizationId,
    contact,
    consentType,
    questionResponses,
    testimonialContent,
    rating,
  };
}
