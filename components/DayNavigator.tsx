import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme, typography, spacing } from '@/lib/theme';

interface DayNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DayNavigator = memo(function DayNavigator({
  selectedDate,
  onDateChange,
}: DayNavigatorProps) {
  const theme = useTheme();
  const translateX = useSharedValue(0);

  const goToPrevious = useCallback(() => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  }, [selectedDate, onDateChange]);

  const goToNext = useCallback(() => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  }, [selectedDate, onDateChange]);

  const goToToday = useCallback(() => {
    onDateChange(new Date());
  }, [onDateChange]);

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX * 0.3;
    })
    .onEnd((event) => {
      if (event.translationX > 50) {
        runOnJS(goToPrevious)();
      } else if (event.translationX < -50) {
        runOnJS(goToNext)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isToday = isSameDay(selectedDate, new Date());
  const dateLabel = formatDateLabel(selectedDate);

  return (
    <View style={[styles.container, { backgroundColor: theme.navBackground, borderBottomColor: theme.navBorder }]}>
      <Pressable
        style={({ pressed }) => [
          styles.navButton,
          pressed && { backgroundColor: theme.cardPressed },
        ]}
        onPress={goToPrevious}
        hitSlop={12}
      >
        <Text style={[styles.navButtonText, { color: theme.accent }]}>‹</Text>
      </Pressable>

      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.dateContainer, animatedStyle]}>
          <Text style={[styles.dateLabel, { color: theme.text }]}>{dateLabel}</Text>
          {!isToday && (
            <Pressable
              style={({ pressed }) => [
                styles.todayButton,
                pressed && { backgroundColor: theme.cardPressed },
              ]}
              onPress={goToToday}
            >
              <Text style={[styles.todayButtonText, { color: theme.accent }]}>
                Today
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </GestureDetector>

      <Pressable
        style={({ pressed }) => [
          styles.navButton,
          pressed && { backgroundColor: theme.cardPressed },
        ]}
        onPress={goToNext}
        hitSlop={12}
      >
        <Text style={[styles.navButtonText, { color: theme.accent }]}>›</Text>
      </Pressable>
    </View>
  );
});

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (isSameDay(date, today)) {
    return 'Today';
  }
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }
  if (isSameDay(date, tomorrow)) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navButtonText: {
    fontSize: 28,
    fontWeight: '300',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    ...typography.headline,
    fontSize: 18,
  },
  todayButton: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  todayButtonText: {
    ...typography.subhead,
  },
});
