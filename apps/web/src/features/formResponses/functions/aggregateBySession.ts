import type { FormAnalyticsEventItem } from '@/entities/formAnalyticsEvent';
import type { SessionStatus, AggregatedSession } from '../models';
import { formatDuration } from './getDuration';

/**
 * Determines the status of a session based on its events
 */
function getSessionStatus(events: FormAnalyticsEventItem[]): SessionStatus {
  const eventTypes = events.map((e) => e.event_type);

  if (eventTypes.includes('form_submitted')) {
    return 'completed';
  }
  if (eventTypes.includes('form_abandoned')) {
    return 'abandoned';
  }
  return 'in_progress';
}

/**
 * Gets the last step info from session events
 */
function getLastStep(events: FormAnalyticsEventItem[]): { type: string | null; index: number | null } {
  // Find the last event that has step info
  const stepsWithInfo = events.filter((e) => e.step_type !== null || e.step_index !== null);

  if (stepsWithInfo.length === 0) {
    return { type: null, index: null };
  }

  // Events are ordered by created_at desc, so first one is the last step
  const lastStep = stepsWithInfo[0];
  return {
    type: lastStep.step_type ?? null,
    index: lastStep.step_index ?? null,
  };
}

/**
 * Aggregates analytics events by session_id
 * Returns an array of session summaries with status and event counts
 */
export function aggregateBySession(events: FormAnalyticsEventItem[]): AggregatedSession[] {
  // Group events by session_id
  const sessionMap = new Map<string, FormAnalyticsEventItem[]>();

  for (const event of events) {
    const sessionEvents = sessionMap.get(event.session_id) ?? [];
    sessionEvents.push(event);
    sessionMap.set(event.session_id, sessionEvents);
  }

  // Transform into aggregated sessions
  const sessions: AggregatedSession[] = [];

  for (const [sessionId, sessionEvents] of sessionMap) {
    // Sort events by created_at descending (most recent first)
    sessionEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const status = getSessionStatus(sessionEvents);
    const lastStep = getLastStep(sessionEvents);

    // First event (oldest) is the start time
    const startedAt = sessionEvents[sessionEvents.length - 1].created_at;
    // Last event (newest) is the last activity
    const lastActivityAt = sessionEvents[0].created_at;

    // Calculate duration
    const durationMs = new Date(lastActivityAt).getTime() - new Date(startedAt).getTime();
    const duration = formatDuration(durationMs);

    sessions.push({
      sessionId,
      status,
      eventCount: sessionEvents.length,
      lastStepType: lastStep.type,
      lastStepIndex: lastStep.index,
      startedAt,
      lastActivityAt,
      duration,
      durationMs,
      events: sessionEvents,
    });
  }

  // Sort sessions by lastActivityAt descending (most recent first)
  sessions.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

  return sessions;
}
