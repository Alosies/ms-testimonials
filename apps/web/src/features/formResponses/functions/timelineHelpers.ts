import type { FormAnalyticsEventItem } from '@/entities/formAnalyticsEvent';
import type { VisitorInfo } from '../models';

/**
 * Event configuration for timeline display
 */
export interface EventConfig {
  icon: string;
  label: string;
  bgClass: string;
  iconClass: string;
  dotClass: string;
}

/**
 * Returns display configuration for an event type
 */
export function getEventConfig(eventType: string): EventConfig {
  switch (eventType) {
    case 'form_started':
      return {
        icon: 'heroicons:play',
        label: 'Started',
        bgClass: 'bg-blue-100 dark:bg-blue-900/30',
        iconClass: 'text-blue-600 dark:text-blue-400',
        dotClass: 'bg-blue-500',
      };
    case 'step_completed':
      return {
        icon: 'heroicons:check',
        label: 'Step Completed',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        dotClass: 'bg-emerald-500',
      };
    case 'step_skipped':
      return {
        icon: 'heroicons:forward',
        label: 'Step Skipped',
        bgClass: 'bg-amber-100 dark:bg-amber-900/30',
        iconClass: 'text-amber-600 dark:text-amber-400',
        dotClass: 'bg-amber-500',
      };
    case 'form_submitted':
      return {
        icon: 'heroicons:check-circle',
        label: 'Submitted',
        bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconClass: 'text-emerald-600 dark:text-emerald-400',
        dotClass: 'bg-emerald-500',
      };
    case 'form_abandoned':
      return {
        icon: 'heroicons:x-circle',
        label: 'Abandoned',
        bgClass: 'bg-red-100 dark:bg-red-900/30',
        iconClass: 'text-red-600 dark:text-red-400',
        dotClass: 'bg-red-500',
      };
    case 'form_resumed':
      return {
        icon: 'heroicons:arrow-path',
        label: 'Resumed',
        bgClass: 'bg-purple-100 dark:bg-purple-900/30',
        iconClass: 'text-purple-600 dark:text-purple-400',
        dotClass: 'bg-purple-500',
      };
    default:
      return {
        icon: 'heroicons:ellipsis-horizontal',
        label: eventType,
        bgClass: 'bg-gray-100 dark:bg-gray-800',
        iconClass: 'text-gray-600 dark:text-gray-400',
        dotClass: 'bg-gray-400',
      };
  }
}

/**
 * Formats a date string to time (e.g., "2:30 PM")
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats a date string to relative date (e.g., "Today", "Yesterday", "Jan 15")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats step info from an event (e.g., "Step 1 · Welcome")
 */
export function formatStepInfo(event: FormAnalyticsEventItem): string | null {
  if (event.step_index == null && !event.step_type) return null;

  const parts: string[] = [];
  if (event.step_index != null) {
    parts.push(`Step ${event.step_index + 1}`);
  }
  if (event.step_type) {
    const formatted = event.step_type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    parts.push(formatted);
  }
  return parts.join(' · ');
}

/**
 * Event data structure for device and geo info
 */
interface EventDataWithInfo {
  device?: {
    isMobile?: boolean;
    screenWidth?: number;
    screenHeight?: number;
    language?: string;
    timezone?: string;
    referrer?: string;
  };
  geo?: {
    country?: string;
    countryCode?: string;
    city?: string;
    region?: string;
    isp?: string;
    org?: string;
  };
}

/**
 * Extracts visitor info from a form_started or form_resumed event
 */
export function extractVisitorInfo(events: FormAnalyticsEventItem[]): VisitorInfo | null {
  // Find the form_started or first form_resumed event with device info
  const infoEvent = events.find(
    (e) =>
      (e.event_type === 'form_started' || e.event_type === 'form_resumed') &&
      (e.event_data as EventDataWithInfo)?.device
  );

  if (!infoEvent) return null;

  const eventData = infoEvent.event_data as EventDataWithInfo;
  const device = eventData.device;
  const geo = eventData.geo;

  const info: VisitorInfo = {};

  if (device) {
    info.device = device.isMobile ? 'Mobile' : 'Desktop';
    if (device.screenWidth && device.screenHeight) {
      info.screenSize = `${device.screenWidth}×${device.screenHeight}`;
    }
    info.language = device.language;
    info.timezone = device.timezone;
    if (device.referrer) {
      // Extract domain from referrer URL
      try {
        const url = new URL(device.referrer);
        info.referrer = url.hostname;
      } catch {
        info.referrer = device.referrer;
      }
    }
  }

  if (geo) {
    info.country = geo.country;
    info.countryCode = geo.countryCode;
    info.city = geo.city;
    info.isp = geo.org || geo.isp;

    // Build location string
    const locationParts: string[] = [];
    if (geo.city) locationParts.push(geo.city);
    if (geo.region && geo.region !== geo.city) locationParts.push(geo.region);
    if (geo.country) locationParts.push(geo.country);
    if (locationParts.length > 0) {
      info.location = locationParts.join(', ');
    }
  }

  return info;
}
