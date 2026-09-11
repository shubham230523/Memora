import React, { useState, useEffect, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { borderRadius, shadows } from '../theme/tokens';
import { typography } from '../theme/typography';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  const hide = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onHide?.());
  }, [fadeAnim, onHide]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(hide, duration);
    return () => clearTimeout(timer);
  }, [fadeAnim, duration, hide]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return themeColors.success;
      case 'error': return themeColors.error;
      default: return themeColors.info;
    }
  };

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: getBackgroundColor(), opacity: fadeAnim }
    ]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: spacing.xl,
    right: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
    zIndex: 9999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
});
