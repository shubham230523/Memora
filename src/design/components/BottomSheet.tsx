import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { borderRadius, shadows } from '../theme/tokens';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
}) => {
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[
            styles.content,
            { backgroundColor: themeColors.surface }
          ]}>
            <View style={[styles.handle, { backgroundColor: themeColors.border }]} />
            {children}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
});
