import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as Calendar from 'expo-calendar';
import { useCalendarSource } from '@/lib/context';
import { useTheme, typography, spacing, radius } from '@/lib/theme';

export default function DeviceCalendars() {
  const { setSource } = useCalendarSource();
  const theme = useTheme();
  const [calendars, setCalendars] = useState<Calendar.Calendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    requestPermissionAndLoad();
  }, []);

  const requestPermissionAndLoad = async () => {
    setIsLoading(true);

    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== 'granted') {
      setPermissionDenied(true);
      setIsLoading(false);
      return;
    }

    try {
      const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      // Filter to only show calendars that allow modifications or are readable
      const readable = cals.filter(
        (c) => c.allowsModifications || c.source.type !== 'birthdays'
      );
      setCalendars(readable);
    } catch (error) {
      Alert.alert('Error', 'Failed to load calendars. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCalendar = useCallback(
    (calendar: Calendar.Calendar) => {
      setSource({
        type: 'device',
        calendarId: calendar.id,
        calendarName: calendar.title,
      });
      router.replace('/today');
    },
    [setSource]
  );

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const renderCalendar = useCallback(
    ({ item }: { item: Calendar.Calendar }) => (
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
            { backgroundColor: item.color || theme.accent },
          ]}
        />
        <View style={styles.calendarInfo}>
          <Text style={[styles.calendarName, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.calendarSource, { color: theme.textTertiary }]}>
            {item.source.name}
          </Text>
        </View>
        <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
      </Pressable>
    ),
    [handleSelectCalendar, theme]
  );

  // Permission denied
  if (permissionDenied) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.warning }]}>
          <Text style={styles.iconText}>🔒</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          Calendar Access Required
        </Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          CalendarCycle needs permission to read your calendars.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.accent },
            pressed && styles.buttonPressed,
          ]}
          onPress={openSettings}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  // Loading
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

  // No calendars found
  if (calendars.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundTertiary }]}>
          <Text style={styles.iconText}>📅</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          No Calendars Found
        </Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          Add a calendar account in Settings to get started.
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
  calendarSource: {
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
