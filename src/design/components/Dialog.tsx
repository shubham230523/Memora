import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { borderRadius, shadows } from '../theme/tokens';
import { typography } from '../theme/typography';
import { Button } from './Button';

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  primaryActionTitle?: string;
  onPrimaryAction?: () => void;
  secondaryActionTitle?: string;
  onSecondaryAction?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  onClose,
  primaryActionTitle,
  onPrimaryAction,
  secondaryActionTitle,
  onSecondaryAction,
}) => {
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.container,
              { backgroundColor: themeColors.surface }
            ]}>
              <Text style={[styles.title, { color: themeColors.text }]}>
                {title}
              </Text>
              {message && (
                <Text style={[styles.message, { color: themeColors.textSecondary }]}>
                  {message}
                </Text>
              )}
              <View style={styles.footer}>
                {secondaryActionTitle && (
                  <Button
                    title={secondaryActionTitle}
                    onPress={onSecondaryAction || onClose}
                    variant="ghost"
                    style={styles.actionButton}
                  />
                )}
                {primaryActionTitle && (
                  <Button
                    title={primaryActionTitle}
                    onPress={onPrimaryAction || onClose}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
    lineHeight: typography.sizes.md * 1.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.sm,
  },
});
