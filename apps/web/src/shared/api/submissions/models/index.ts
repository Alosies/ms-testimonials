/**
 * Submission API Models
 *
 * Request/response types for the form submission endpoint.
 * ADR-025: Phase 5c
 */

export interface SubmitFormContact {
  email: string;
  name?: string;
  jobTitle?: string;
  companyName?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  avatarUrl?: string;
}

export interface SubmitFormQuestionResponse {
  questionId: string;
  answerText?: string;
  answerInteger?: number;
  answerBoolean?: boolean;
  answerJson?: unknown;
  answerUrl?: string;
}

export interface SubmitFormRequest {
  formId: string;
  organizationId: string;
  contact: SubmitFormContact;
  consentType?: 'public' | 'private';
  questionResponses: SubmitFormQuestionResponse[];
  testimonialContent?: string;
  rating?: number;
}

export interface SubmitFormResponse {
  success: boolean;
  submissionId: string;
  testimonialId?: string;
}
