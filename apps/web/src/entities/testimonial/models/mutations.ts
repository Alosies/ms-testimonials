import type {
  ApproveTestimonialMutation,
  ApproveTestimonialMutationVariables,
  RejectTestimonialMutation,
  RejectTestimonialMutationVariables,
} from '@/shared/graphql/generated/operations';

// Re-export Mutation Variables
export type ApproveTestimonialVariables = ApproveTestimonialMutationVariables;
export type RejectTestimonialVariables = RejectTestimonialMutationVariables;

// Extract Mutation Result Types
export type ApproveTestimonialResult = NonNullable<
  ApproveTestimonialMutation['update_testimonials_by_pk']
>;
export type RejectTestimonialResult = NonNullable<
  RejectTestimonialMutation['update_testimonials_by_pk']
>;
