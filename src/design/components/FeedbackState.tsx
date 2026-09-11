import { View, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Icon, IconName } from './Icon';
import { Button } from './Button';

interface FeedbackStateProps {
  title: string;
  message?: string;
  icon?: IconName;
  actionTitle?: string;
  onActionPress?: () => void;
  type?: 'error' | 'empty' | 'info';
  style?: StyleProp<ViewStyle>;
}

export const FeedbackState: React.FC<FeedbackStateProps> = ({
  title,
  message,
  icon,
  actionTitle,
  onActionPress,
  type = 'info',
  style,
}) => {
  const isDark = false; // TODO: Hook into theme
  const themeColors = isDark ? colors.dark : colors.light;

  const getIconColor = () => {
    if (type === 'error') return themeColors.error;
    return themeColors.textSecondary;
  };

  return (
    <View style={[styles.container, style]}>
      {icon && <Icon name={icon} size={64} color={getIconColor()} />}
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: themeColors.textSecondary }]}>
          {message}
        </Text>
      )}
      {actionTitle && onActionPress && (
        <Button
          title={actionTitle}
          onPress={onActionPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: typography.sizes.md * 1.5,
  },
  button: {
    marginTop: spacing.xl,
  },
});
