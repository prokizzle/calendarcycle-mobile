import { useState, useEffect } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { setGoogleTokens, getGoogleTokens } from '../secure';
import type { CalendarEvent } from '../types';

WebBrowser.maybeCompleteAuthSession();

// You must configure these in your Google Cloud Console
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  primary?: boolean;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
}

export function useGoogleAuth() {
  const [tokens, setTokens] = useState<GoogleTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: SCOPES,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    loadStoredTokens();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      exchangeCodeForTokens(response.params.code);
    }
  }, [response]);

  const loadStoredTokens = async () => {
    const stored = await getGoogleTokens();
    if (stored.accessToken) {
      setTokens({
        accessToken: stored.accessToken,
        refreshToken: stored.refreshToken ?? undefined,
      });
    }
    setIsLoading(false);
  };

  const exchangeCodeForTokens = async (code: string) => {
    if (!request?.codeVerifier) return;

    setIsLoading(true);
    try {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          code,
          redirectUri: AuthSession.makeRedirectUri(),
          extraParams: {
            code_verifier: request.codeVerifier,
          },
        },
        discovery
      );

      const newTokens: GoogleTokens = {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken ?? undefined,
      };

      await setGoogleTokens(
        tokenResponse.accessToken,
        tokenResponse.refreshToken ?? undefined
      );
      setTokens(newTokens);
    } catch (error) {
      console.error('Token exchange failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tokens,
    isLoading,
    promptAsync,
    isReady: !!request,
  };
}

export async function fetchGoogleCalendars(
  accessToken: string
): Promise<GoogleCalendar[]> {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch calendars: ${response.status}`);
  }

  const data = await response.json();
  return data.items as GoogleCalendar[];
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  const data = await response.json();

  return (data.items || []).map(
    (item: {
      id: string;
      summary?: string;
      description?: string;
      location?: string;
      start: { date?: string; dateTime?: string };
      end: { date?: string; dateTime?: string };
    }) => {
      const isAllDay = !!item.start.date;
      const startDate = isAllDay
        ? item.start.date!
        : item.start.dateTime!.split('T')[0];
      const startTime = isAllDay
        ? undefined
        : item.start.dateTime!.split('T')[1].substring(0, 5);

      const endDate = isAllDay
        ? item.end.date
        : item.end.dateTime?.split('T')[0];
      const endTime =
        isAllDay || !item.end.dateTime
          ? undefined
          : item.end.dateTime.split('T')[1].substring(0, 5);

      return {
        id: item.id,
        title: item.summary || 'Untitled',
        description: item.description,
        startDate,
        startTime,
        endDate,
        endTime,
        isAllDay,
        location: item.location,
      } satisfies CalendarEvent;
    }
  );
}
