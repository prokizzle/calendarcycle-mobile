import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useTodayItems } from '@/hooks/useTodayItems';
import { useCompletions } from '@/hooks/useCompletions';
import { ScheduleItem } from '@/components/ScheduleItem';
import { DayNavigator } from '@/components/DayNavigator';
import { useTheme, typography, spacing, radius } from '@/lib/theme';
import type { CalendarEvent } from '@/lib/types';

export default function Today() {
  const theme = useTheme();
  const {
    events,
    selectedDate,
    setSelectedDate,
    isLoading,
    refresh,
    error,
  } = useTodayItems();

  const { completions, toggleCompletion } = useCompletions(selectedDate);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      // Sort by time, all-day events first
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  }, [events]);

  const handleToggle = useCallback(
    (eventId: string) => {
      toggleCompletion(eventId);
    },
    [toggleCompletion]
  );

  const renderItem = useCallback(
    ({ item }: { item: CalendarEvent }) => (
      <ScheduleItem
        event={item}
        isCompleted={completions[item.id] ?? false}
        onToggle={() => handleToggle(item.id)}
      />
    ),
    [completions, handleToggle]
  );

  const handleChangeSource = () => {
    router.push('/setup');
  };

  // Calculate progress
  const completedCount = sortedEvents.filter((e) => completions[e.id]).length;
  const totalCount = sortedEvents.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.error + '20' }]}>
          <Text style={styles.iconText}>⚠️</Text>
        </View>
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Unable to Load
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textTertiary }]}>
          {error}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: theme.accent },
            pressed && styles.buttonPressed,
          ]}
          onPress={refresh}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <DayNavigator
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Progress bar */}
      {totalCount > 0 && (
        <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {completedCount} of {totalCount} completed
            </Text>
            <Text style={[styles.progressPercent, { color: theme.accent }]}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.success, width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>
      )}

      <FlatList
        data={sortedEvents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          sortedEvents.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundTertiary }]}>
              <Text style={styles.emptyIconText}>✨</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Items
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.textTertiary }]}>
              Nothing scheduled for this day
            </Text>
          </View>
        }
      />

      <Pressable
        style={({ pressed }) => [
          styles.changeSourceButton,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.separator,
          },
          pressed && { backgroundColor: theme.cardPressed },
        ]}
        onPress={handleChangeSource}
      >
        <Text style={[styles.changeSourceText, { color: theme.accent }]}>
          Change Calendar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
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
  progressContainer: {
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.subhead,
  },
  progressPercent: {
    ...typography.subhead,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  list: {
    padding: spacing.lg,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyTitle: {
    ...typography.title3,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
  },
  errorTitle: {
    ...typography.title3,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 48,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    ...typography.headline,
  },
  changeSourceButton: {
    padding: spacing.lg,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  changeSourceText: {
    ...typography.body,
  },
});
