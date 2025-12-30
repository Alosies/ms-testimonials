import type {
  GetTestimonialQuery,
  GetTestimonialQueryVariables,
  GetTestimonialsQuery,
  GetTestimonialsQueryVariables,
  GetTestimonialsStatsQueryVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Query Variables
export type GetTestimonialVariables = GetTestimonialQueryVariables;
export type GetTestimonialsVariables = GetTestimonialsQueryVariables;
export type GetTestimonialsStatsVariables = GetTestimonialsStatsQueryVariables;

// Extract Data Types from Queries
export type Testimonial = NonNullable<GetTestimonialQuery['testimonials_by_pk']>;
export type TestimonialsData = GetTestimonialsQuery['testimonials'];
export type TestimonialItem = GetTestimonialsQuery['testimonials'][number];

// Stats Types
export type TestimonialsStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};
