import { Platform } from 'react-native';

export const typography = {
  fonts: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'sans-serif',
    }),
    monospace: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
