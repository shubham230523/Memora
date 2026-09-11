import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { borderRadius, shadows } from '../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    ...shadows.sm,
  },
});
