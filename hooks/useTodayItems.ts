import { useState, useEffect, useCallback } from 'react';
import { useCalendarSource } from '@/lib/context';
import { fetchFeedEvents } from '@/lib/sources/feed';
import { fetchGoogleCalendarEvents } from '@/lib/sources/google';
import { fetchDeviceCalendarEvents } from '@/lib/sources/device';
import type { CalendarEvent } from '@/lib/types';

export function useTodayItems() {
  const { source } = useCalendarSource();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!source) {
      setAllEvents([]);
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetched: CalendarEvent[] = [];

      switch (source.type) {
        case 'feed':
          fetched = await fetchFeedEvents(source.url);
          break;

        case 'google':
          // Fetch 30 days range
          const gStart = new Date();
          gStart.setDate(gStart.getDate() - 7);
          const gEnd = new Date();
          gEnd.setDate(gEnd.getDate() + 30);

          fetched = await fetchGoogleCalendarEvents(
            source.accessToken,
            source.calendarId,
            gStart.toISOString(),
            gEnd.toISOString()
          );
          break;

        case 'device':
          // Fetch 30 days range
          const dStart = new Date();
          dStart.setDate(dStart.getDate() - 7);
          const dEnd = new Date();
          dEnd.setDate(dEnd.getDate() + 30);

          fetched = await fetchDeviceCalendarEvents(
            source.calendarId,
            dStart,
            dEnd
          );
          break;
      }

      setAllEvents(fetched);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load events';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [source]);

  // Fetch on mount and when source changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events for selected date
  useEffect(() => {
    const dateStr = formatDateString(selectedDate);
    const filtered = allEvents.filter((event) => event.startDate === dateStr);
    setEvents(filtered);
  }, [allEvents, selectedDate]);

  const refresh = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    selectedDate,
    setSelectedDate,
    isLoading,
    error,
    refresh,
  };
}

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
