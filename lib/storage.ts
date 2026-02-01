import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalendarSource, CompletionsStorage, Completions } from './types';

const KEYS = {
  SOURCE: 'calendar_source',
  COMPLETIONS: 'completions',
} as const;

// Calendar Source
export async function getStoredSource(): Promise<CalendarSource | null> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SOURCE);
    if (!json) return null;
    return JSON.parse(json) as CalendarSource;
  } catch {
    return null;
  }
}

export async function setStoredSource(source: CalendarSource): Promise<void> {
  await AsyncStorage.setItem(KEYS.SOURCE, JSON.stringify(source));
}

export async function clearStoredSource(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SOURCE);
}

// Completions
export async function getCompletions(
  dateString: string
): Promise<Completions> {
  try {
    const json = await AsyncStorage.getItem(KEYS.COMPLETIONS);
    if (!json) return {};
    const all: CompletionsStorage = JSON.parse(json);
    return all[dateString] ?? {};
  } catch {
    return {};
  }
}

export async function setCompletion(
  dateString: string,
  eventId: string,
  completed: boolean
): Promise<void> {
  try {
    const json = await AsyncStorage.getItem(KEYS.COMPLETIONS);
    const all: CompletionsStorage = json ? JSON.parse(json) : {};

    if (!all[dateString]) {
      all[dateString] = {};
    }

    all[dateString][eventId] = completed;

    // Prune old dates (keep last 30 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    for (const key of Object.keys(all)) {
      if (key < cutoffStr) {
        delete all[key];
      }
    }

    await AsyncStorage.setItem(KEYS.COMPLETIONS, JSON.stringify(all));
  } catch {
    // Silently fail - completions are not critical
  }
}
