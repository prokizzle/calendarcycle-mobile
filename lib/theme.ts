import { useColorScheme } from 'react-native';

export const colors = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F7',
    backgroundTertiary: '#E5E5EA',

    // Text
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',

    // Accents
    accent: '#007AFF',
    accentSecondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',

    // UI Elements
    border: '#C6C6C8',
    borderLight: '#E5E5EA',
    separator: '#C6C6C8',
    card: '#FFFFFF',
    cardPressed: '#F2F2F7',

    // Checkbox
    checkboxBorder: '#007AFF',
    checkboxFill: '#007AFF',
    checkboxCheck: '#FFFFFF',

    // Navigation
    navBackground: '#FFFFFF',
    navBorder: '#C6C6C8',

    // Status bar
    statusBar: 'dark' as const,
  },
  dark: {
    // Backgrounds
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',

    // Text
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',

    // Accents
    accent: '#0A84FF',
    accentSecondary: '#5E5CE6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',

    // UI Elements
    border: '#38383A',
    borderLight: '#2C2C2E',
    separator: '#38383A',
    card: '#1C1C1E',
    cardPressed: '#2C2C2E',

    // Checkbox
    checkboxBorder: '#0A84FF',
    checkboxFill: '#0A84FF',
    checkboxCheck: '#FFFFFF',

    // Navigation
    navBackground: '#1C1C1E',
    navBorder: '#38383A',

    // Status bar
    statusBar: 'light' as const,
  },
} as const;

export type Theme = typeof colors.light;
export type ColorScheme = 'light' | 'dark';

export function useTheme(): Theme & { colorScheme: ColorScheme } {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  return { ...theme, colorScheme };
}

// Typography scale (following iOS HIG)
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
} as const;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// Border radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;
