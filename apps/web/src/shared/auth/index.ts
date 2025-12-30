// Re-export supabase client
export { supabase } from './supabase';

// Re-export useAuth from the auth feature for backwards compatibility
// Prefer importing directly from @/features/auth
export { useAuth } from '@/features/auth';
