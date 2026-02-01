import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, typography, spacing, radius } from '@/lib/theme';
import type { CalendarEvent } from '@/lib/types';

interface ScheduleItemProps {
  event: CalendarEvent;
  isCompleted: boolean;
  onToggle: () => void;
}

export const ScheduleItem = memo(function ScheduleItem({
  event,
  isCompleted,
  onToggle,
}: ScheduleItemProps) {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    // Haptic feedback on toggle
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.selectionAsync();
    }
    onToggle();
  }, [onToggle]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.card },
        pressed && { backgroundColor: theme.cardPressed },
        isCompleted && styles.completed,
      ]}
      onPress={handlePress}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: theme.checkboxBorder },
          isCompleted && { backgroundColor: theme.checkboxFill, borderColor: theme.checkboxFill },
        ]}
      >
        {isCompleted && (
          <Text style={[styles.checkmark, { color: theme.checkboxCheck }]}>✓</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.text },
            isCompleted && [styles.titleCompleted, { color: theme.textTertiary }],
          ]}
          numberOfLines={2}
        >
          {event.title}
        </Text>

        <View style={styles.metaRow}>
          {event.startTime && (
            <View style={styles.timeBadge}>
              <Text style={[styles.timeIcon]}>🕐</Text>
              <Text style={[styles.time, { color: theme.accent }]}>
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
              </Text>
            </View>
          )}

          {event.isAllDay && (
            <View style={styles.timeBadge}>
              <Text style={styles.timeIcon}>☀️</Text>
              <Text style={[styles.time, { color: theme.accent }]}>All day</Text>
            </View>
          )}
        </View>

        {event.description && (
          <Text
            style={[styles.description, { color: theme.textTertiary }]}
            numberOfLines={1}
          >
            {event.description}
          </Text>
        )}

        {event.location && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text
              style={[styles.location, { color: theme.textTertiary }]}
              numberOfLines={1}
            >
              {event.location}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    marginRight: spacing.md,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  time: {
    ...typography.subhead,
    fontWeight: '500',
  },
  description: {
    ...typography.subhead,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    ...typography.footnote,
    flex: 1,
  },
});
