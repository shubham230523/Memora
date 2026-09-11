import { ViewStyle, StyleProp } from 'react-native';
import { FeedbackState } from './FeedbackState';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: any; // IconName
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message,
  icon = 'database-outline',
  actionTitle,
  onActionPress,
  style,
}) => (
  <FeedbackState
    type="empty"
    icon={icon}
    title={title}
    message={message}
    actionTitle={actionTitle}
    onActionPress={onActionPress}
    style={style}
  />
);
