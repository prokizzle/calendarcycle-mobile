import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, useColorScheme } from 'react-native';
import { CalendarSourceProvider } from '@/lib/context';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];

  return (
    <GestureHandlerRootView style={styles.container}>
      <CalendarSourceProvider>
        <StatusBar style={theme.statusBar} />
        <Stack
          screenOptions={{
            headerShown: true,
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: theme.navBackground,
            },
            headerTintColor: theme.accent,
            headerTitleStyle: {
              color: theme.text,
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: theme.backgroundSecondary,
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="setup" options={{ title: 'Add Calendar' }} />
          <Stack.Screen
            name="google-calendars"
            options={{ title: 'Google Calendars' }}
          />
          <Stack.Screen
            name="device-calendars"
            options={{ title: 'Device Calendars' }}
          />
          <Stack.Screen
            name="today"
            options={{
              title: 'Today',
              headerLargeTitle: true,
            }}
          />
        </Stack>
      </CalendarSourceProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
