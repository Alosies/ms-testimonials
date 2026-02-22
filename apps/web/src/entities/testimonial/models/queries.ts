import type {
  GetTestimonialQuery,
  GetTestimonialQueryVariables,
  GetTestimonialsQuery,
  GetTestimonialsQueryVariables,
  GetTestimonialsStatsQueryVariables,
  GetTestimonialsWithFormQuery,
  GetTestimonialsWithFormQueryVariables,
  GetFormTestimonialsQuery,
  GetFormTestimonialsQueryVariables,
  GetFormTestimonialsStatsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetTestimonialVariables = GetTestimonialQueryVariables;
export type GetTestimonialsVariables = GetTestimonialsQueryVariables;
export type GetTestimonialsStatsVariables = GetTestimonialsStatsQueryVariables;
export type GetTestimonialsWithFormVariables = GetTestimonialsWithFormQueryVariables;
export type GetFormTestimonialsVariables = GetFormTestimonialsQueryVariables;
export type GetFormTestimonialsStatsVariables = GetFormTestimonialsStatsQueryVariables;

// Extract Data Types from Queries
export type Testimonial = NonNullable<GetTestimonialQuery['testimonials_by_pk']>;
export type TestimonialsData = GetTestimonialsQuery['testimonials'];
export type TestimonialItem = GetTestimonialsQuery['testimonials'][number];

// Extract Data Types from WithForm Queries
export type TestimonialWithFormItem = GetTestimonialsWithFormQuery['testimonials'][number];
export type TestimonialSubmission = NonNullable<TestimonialWithFormItem['submission']>;
export type TestimonialForm = NonNullable<TestimonialSubmission['form']>;
export type FormTestimonialsData = GetFormTestimonialsQuery['testimonials'];

// Stats Types
export type TestimonialsStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};
