export type * from './queries';
export type * from './mutations';

// Utility types
export type TestimonialId = string;
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';
export type TestimonialSource = 'form' | 'import' | 'manual';
