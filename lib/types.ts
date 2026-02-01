export type CalendarSourceType = 'feed' | 'google' | 'device';

export type CalendarSource =
  | { type: 'feed'; url: string }
  | {
      type: 'google';
      calendarId: string;
      calendarName: string;
      accessToken: string;
      refreshToken?: string;
    }
  | {
      type: 'device';
      calendarId: string;
      calendarName: string;
    };

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  startTime?: string; // HH:mm format, undefined for all-day
  endDate?: string;
  endTime?: string;
  isAllDay: boolean;
  location?: string;
}

export interface Completions {
  [eventId: string]: boolean;
}

export interface CompletionsStorage {
  [dateString: string]: Completions;
}
