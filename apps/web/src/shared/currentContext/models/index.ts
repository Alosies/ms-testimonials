/**
 * Current Context Types
 */

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
}

export interface CurrentOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  setupStatus: 'pending_setup' | 'completed';
}
