import type { Ref, ComputedRef } from 'vue';
import type { FormAnalyticsEventItem } from '@/entities/formAnalyticsEvent';

export type SessionStatus = 'completed' | 'abandoned' | 'in_progress';

export interface AggregatedSession {
  sessionId: string;
  status: SessionStatus;
  eventCount: number;
  lastStepType: string | null;
  lastStepIndex: number | null;
  startedAt: string;
  lastActivityAt: string;
  duration: string;
  durationMs: number;
  events: FormAnalyticsEventItem[];
}

export type SortColumn = 'session' | 'status' | 'events' | 'lastStep' | 'duration' | 'started' | 'lastActivity';
export type SortDirection = 'asc' | 'desc';

/**
 * State interface for the form responses table
 */
export interface FormResponsesTableState {
  statusFilter: Ref<SessionStatus | 'all'>;
  sortColumn: Ref<SortColumn>;
  sortDirection: Ref<SortDirection>;
  filteredAndSortedSessions: ComputedRef<AggregatedSession[]>;
  hasFilteredSessions: ComputedRef<boolean>;
  toggleSort: (column: SortColumn) => void;
  setStatusFilter: (status: SessionStatus | 'all') => void;
}

/**
 * Visitor information extracted from analytics events.
 * Contains device and geo data from form_started/form_resumed events.
 */
export interface VisitorInfo {
  // Device info
  device?: string;
  screenSize?: string;
  language?: string;
  timezone?: string;
  referrer?: string;
  // Geo info (from server)
  location?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  isp?: string;
}
