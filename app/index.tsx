import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useCalendarSource } from '@/lib/context';
import { useTheme } from '@/lib/theme';

export default function Index() {
  const { source, isLoading } = useCalendarSource();
  const theme = useTheme();

  useEffect(() => {
    if (!isLoading) {
      if (source) {
        router.replace('/today');
      } else {
        router.replace('/setup');
      }
    }
  }, [source, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
