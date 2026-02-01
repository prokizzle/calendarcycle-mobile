import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useCalendarSource } from '@/lib/context';
import { useTheme, typography, spacing, radius } from '@/lib/theme';
import {
  useGoogleAuth,
  fetchGoogleCalendars,
  GoogleCalendar,
} from '@/lib/sources/google';

export default function GoogleCalendars() {
  const { setSource } = useCalendarSource();
  const theme = useTheme();
  const { promptAsync, tokens, isLoading: authLoading } = useGoogleAuth();
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokens?.accessToken) {
      loadCalendars();
    }
  }, [tokens]);

  const loadCalendars = async () => {
    if (!tokens?.accessToken) return;

    setIsLoading(true);
    try {
      const cals = await fetchGoogleCalendars(tokens.accessToken);
      setCalendars(cals);
    } catch (error) {
      Alert.alert('Error', 'Failed to load calendars. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCalendar = useCallback(
    (calendar: GoogleCalendar) => {
      if (!tokens) return;

      setSource({
        type: 'google',
        calendarId: calendar.id,
        calendarName: calendar.summary,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      router.replace('/today');
    },
    [tokens, setSource]
  );

  const renderCalendar = useCallback(
    ({ item }: { item: GoogleCalendar }) => (
      <Pressable
        style={({ pressed }) => [
          styles.calendarItem,
          { backgroundColor: theme.card },
          pressed && { backgroundColor: theme.cardPressed },
        ]}
        onPress={() => handleSelectCalendar(item)}
      >
        <View
          style={[
            styles.colorDot,
            { backgroundColor: item.backgroundColor || theme.accent },
          ]}
        />
        <View style={styles.calendarInfo}>
          <Text style={[styles.calendarName, { color: theme.text }]}>
            {item.summary}
          </Text>
          {item.description && (
            <Text
              style={[styles.calendarDescription, { color: theme.textTertiary }]}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          )}
        </View>
        <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
      </Pressable>
    ),
    [handleSelectCalendar, theme]
  );

  // Not authenticated yet
  if (!tokens) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centered}>
          <View style={[styles.iconContainer, { backgroundColor: '#4285F4' }]}>
            <Text style={styles.iconText}>G</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Connect Google Calendar
          </Text>
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
            Sign in to access your Google Calendars
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: '#4285F4' },
              pressed && styles.buttonPressed,
            ]}
            onPress={() => promptAsync()}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign in with Google</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Loading calendars
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.textTertiary }]}>
          Loading calendars...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <Text style={[styles.header, { color: theme.textTertiary }]}>
        SELECT A CALENDAR
      </Text>
      <FlatList
        data={calendars}
        renderItem={renderCalendar}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    ...typography.title2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  button: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    minHeight: 52,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    ...typography.headline,
  },
  header: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    minHeight: 56,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    ...typography.body,
    fontWeight: '500',
  },
  calendarDescription: {
    ...typography.subhead,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 28,
  },
  loadingText: {
    marginTop: spacing.lg,
    ...typography.body,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});
