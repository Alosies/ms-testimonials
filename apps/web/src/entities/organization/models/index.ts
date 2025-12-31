export type * from './queries';
export type * from './mutations';
export { isAdminRole, isOwnerRole } from './queries';

// ========================================
// Utility Types
// ========================================
export type OrganizationId = string;
export type OrganizationSetupStatus = 'pending_setup' | 'completed';
