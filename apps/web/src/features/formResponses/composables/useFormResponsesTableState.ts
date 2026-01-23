import { ref, computed, type Ref } from 'vue';
import type {
  AggregatedSession,
  SessionStatus,
  SortColumn,
  SortDirection,
  FormResponsesTableState,
} from '../models';

/**
 * Composable for managing form responses table filter and sort state
 */
export function useFormResponsesTableState(sessions: Ref<AggregatedSession[]>): FormResponsesTableState {
  const statusFilter = ref<SessionStatus | 'all'>('all');
  const sortColumn = ref<SortColumn>('lastActivity');
  const sortDirection = ref<SortDirection>('desc');

  const toggleSort = (column: SortColumn): void => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn.value = column;
      sortDirection.value = 'desc';
    }
  };

  const setStatusFilter = (status: SessionStatus | 'all'): void => {
    statusFilter.value = status;
  };

  const filteredAndSortedSessions = computed((): AggregatedSession[] => {
    let result = [...sessions.value];

    // Filter by status
    if (statusFilter.value !== 'all') {
      result = result.filter((session) => session.status === statusFilter.value);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortColumn.value) {
        case 'session':
          comparison = a.sessionId.localeCompare(b.sessionId);
          break;
        case 'status': {
          const statusOrder = { completed: 2, in_progress: 1, abandoned: 0 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case 'events':
          comparison = a.eventCount - b.eventCount;
          break;
        case 'lastStep': {
          const aIndex = a.lastStepIndex ?? -1;
          const bIndex = b.lastStepIndex ?? -1;
          comparison = aIndex - bIndex;
          break;
        }
        case 'duration':
          comparison = a.durationMs - b.durationMs;
          break;
        case 'started':
          comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
          break;
        case 'lastActivity':
          comparison = new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime();
          break;
      }

      return sortDirection.value === 'asc' ? comparison : -comparison;
    });

    return result;
  });

  const hasFilteredSessions = computed(() => filteredAndSortedSessions.value.length > 0);

  return {
    statusFilter,
    sortColumn,
    sortDirection,
    filteredAndSortedSessions,
    hasFilteredSessions,
    toggleSort,
    setStatusFilter,
  };
}
