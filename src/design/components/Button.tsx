import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { borderRadius } from '../theme/tokens';
import { typography } from '../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: themeColors.secondary },
          text: { color: themeColors.primary },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: themeColors.primary
          },
          text: { color: themeColors.primary },
        };
      case 'ghost':
        return {
          button: { backgroundColor: 'transparent' },
          text: { color: themeColors.primary },
        };
      default:
        return {
          button: { backgroundColor: themeColors.primary },
          text: { color: themeColors.primaryContrast },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantStyles.button,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      testID="button"
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} testID="button-loading" />
      ) : (
        <Text style={[styles.text, variantStyles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
