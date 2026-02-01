import { useState, useEffect, useCallback } from 'react';
import { getCompletions, setCompletion } from '@/lib/storage';
import type { Completions } from '@/lib/types';

export function useCompletions(date: Date) {
  const [completions, setCompletions] = useState<Completions>({});
  const dateString = formatDateString(date);

  useEffect(() => {
    loadCompletions();
  }, [dateString]);

  const loadCompletions = async () => {
    const stored = await getCompletions(dateString);
    setCompletions(stored);
  };

  const toggleCompletion = useCallback(
    async (eventId: string) => {
      const currentValue = completions[eventId] ?? false;
      const newValue = !currentValue;

      // Optimistic update
      setCompletions((prev) => ({
        ...prev,
        [eventId]: newValue,
      }));

      // Persist
      await setCompletion(dateString, eventId, newValue);
    },
    [completions, dateString]
  );

  return {
    completions,
    toggleCompletion,
  };
}

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
