import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message }) => {
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={themeColors.primary} />
      {message && (
        <Text style={[styles.text, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  text: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
});
