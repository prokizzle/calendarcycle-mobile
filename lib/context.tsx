import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { getStoredSource, setStoredSource, clearStoredSource } from './storage';
import type { CalendarSource } from './types';

interface CalendarSourceContextValue {
  source: CalendarSource | null;
  isLoading: boolean;
  setSource: (source: CalendarSource) => void;
  clearSource: () => void;
}

const CalendarSourceContext = createContext<CalendarSourceContextValue | null>(
  null
);

export function CalendarSourceProvider({ children }: { children: ReactNode }) {
  const [source, setSourceState] = useState<CalendarSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSource();
  }, []);

  const loadSource = async () => {
    const stored = await getStoredSource();
    setSourceState(stored);
    setIsLoading(false);
  };

  const setSource = useCallback((newSource: CalendarSource) => {
    setSourceState(newSource);
    setStoredSource(newSource);
  }, []);

  const clearSource = useCallback(() => {
    setSourceState(null);
    clearStoredSource();
  }, []);

  return (
    <CalendarSourceContext.Provider
      value={{ source, isLoading, setSource, clearSource }}
    >
      {children}
    </CalendarSourceContext.Provider>
  );
}

export function useCalendarSource(): CalendarSourceContextValue {
  const context = useContext(CalendarSourceContext);
  if (!context) {
    throw new Error(
      'useCalendarSource must be used within CalendarSourceProvider'
    );
  }
  return context;
}
