import * as Calendar from 'expo-calendar';
import type { CalendarEvent } from '../types';

export async function fetchDeviceCalendarEvents(
  calendarId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const events = await Calendar.getEventsAsync(
    [calendarId],
    startDate,
    endDate
  );

  return events.map((event) => {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : undefined;
    const isAllDay = event.allDay ?? false;

    return {
      id: event.id,
      title: event.title || 'Untitled',
      description: event.notes ?? undefined,
      startDate: formatDateString(start),
      startTime: isAllDay ? undefined : formatTimeString(start),
      endDate: end ? formatDateString(end) : undefined,
      endTime: isAllDay || !end ? undefined : formatTimeString(end),
      isAllDay,
      location: event.location ?? undefined,
    } satisfies CalendarEvent;
  });
}

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTimeString(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
