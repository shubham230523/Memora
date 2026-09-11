import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { borderRadius } from '../theme/tokens';

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.secondary },
      style
    ]}>
      <View style={[
        styles.fill,
        {
          backgroundColor: theme.colors.primary,
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    width: '100%',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
