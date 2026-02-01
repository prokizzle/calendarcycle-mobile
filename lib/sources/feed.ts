import ICAL from 'ical.js';
import type { CalendarEvent } from '../types';

export async function fetchFeedEvents(
  feedUrl: string
): Promise<CalendarEvent[]> {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: 'text/calendar',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`);
  }

  const icsText = await response.text();
  return parseICalEvents(icsText);
}

function parseICalEvents(icsText: string): CalendarEvent[] {
  const jcalData = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  const events: CalendarEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);

    const startDate = event.startDate;
    const endDate = event.endDate;
    const isAllDay = startDate.isDate;

    events.push({
      id: event.uid || `feed-${events.length}`,
      title: event.summary || 'Untitled',
      description: event.description || undefined,
      startDate: formatDate(startDate),
      startTime: isAllDay ? undefined : formatTime(startDate),
      endDate: endDate ? formatDate(endDate) : undefined,
      endTime: isAllDay || !endDate ? undefined : formatTime(endDate),
      isAllDay,
      location: event.location || undefined,
    });
  }

  return events;
}

function formatDate(icalTime: ICAL.Time): string {
  const jsDate = icalTime.toJSDate();
  return jsDate.toISOString().split('T')[0];
}

function formatTime(icalTime: ICAL.Time): string {
  const jsDate = icalTime.toJSDate();
  const hours = jsDate.getHours().toString().padStart(2, '0');
  const minutes = jsDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
