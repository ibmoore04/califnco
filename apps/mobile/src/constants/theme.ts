/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    primary: '#0284C7',
    primaryDark: '#0369A1',
    primaryLight: '#E0F2FE',
    accent: '#06B6D4',
    teal: '#0D9488',
    card: '#FFFFFF',
    border: '#E2E8F0',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
  },
  dark: {
    text: '#F8FAFC',
    background: '#090D16',
    backgroundElement: '#131B2E',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
    primary: '#38BDF8',
    primaryDark: '#0284C7',
    primaryLight: '#082F49',
    accent: '#22D3EE',
    teal: '#2DD4BF',
    card: '#0F172A',
    border: '#1E293B',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Typography = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export const Fonts = {
  sans: 'Inter_400Regular',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  serif: 'serif',
  rounded: 'Inter_400Regular',
  mono: 'monospace',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
