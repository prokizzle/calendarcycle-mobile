import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { useCalendarSource } from '@/lib/context';
import { useTheme, typography, spacing, radius } from '@/lib/theme';

export default function Setup() {
  const { setSource } = useCalendarSource();
  const theme = useTheme();
  const [feedUrl, setFeedUrl] = useState('');

  const handleFeedSubmit = () => {
    const trimmed = feedUrl.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a feed URL');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      Alert.alert('Error', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setSource({ type: 'feed', url: trimmed });
    router.replace('/today');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Add a source
        </Text>
        <Text style={[styles.subtitle, { color: theme.textTertiary }]}>
          Load tasks and events from an iCal feed or Google Calendar
        </Text>

        {/* iCal Feed URL */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ICAL FEED URL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="https://example.com/feed.ics"
            placeholderTextColor={theme.textTertiary}
            value={feedUrl}
            onChangeText={setFeedUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.accent },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleFeedSubmit}
          >
            <Text style={styles.buttonText}>Use iCal feed</Text>
          </Pressable>
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerText, { color: theme.textTertiary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {/* Google Calendar */}
        <Pressable
          style={({ pressed }) => [
            styles.optionButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && { backgroundColor: theme.cardPressed },
          ]}
          onPress={() => router.push('/google-calendars')}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#4285F4' }]}>
            <Text style={styles.optionIconText}>G</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionButtonText, { color: theme.text }]}>
              Connect Google Calendar
            </Text>
            <Text style={[styles.optionDescription, { color: theme.textTertiary }]}>
              Sign in to access your calendars
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
        </Pressable>

        {/* Device Calendars */}
        <Pressable
          style={({ pressed }) => [
            styles.optionButton,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            pressed && { backgroundColor: theme.cardPressed },
          ]}
          onPress={() => router.push('/device-calendars')}
        >
          <View style={[styles.optionIcon, { backgroundColor: theme.accent }]}>
            <Text style={styles.optionIconText}>📅</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={[styles.optionButtonText, { color: theme.text }]}>
              {Platform.OS === 'ios' ? 'iPhone' : 'Device'} Calendar
            </Text>
            <Text style={[styles.optionDescription, { color: theme.textTertiary }]}>
              Use calendars synced to this device
            </Text>
          </View>
          <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  title: {
    ...typography.largeTitle,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...typography.body,
    marginBottom: spacing.md,
  },
  button: {
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    ...typography.headline,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: spacing.lg,
    ...typography.subhead,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 72,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionContent: {
    flex: 1,
  },
  optionButtonText: {
    ...typography.headline,
    marginBottom: 2,
  },
  optionDescription: {
    ...typography.subhead,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});
