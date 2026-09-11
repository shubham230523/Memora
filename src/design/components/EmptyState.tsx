import React from 'react';
import { FeedbackState } from './FeedbackState';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: any; // IconName
  actionTitle?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  message,
  icon = 'database-outline',
  actionTitle,
  onActionPress,
}) => (
  <FeedbackState
    type="empty"
    icon={icon}
    title={title}
    message={message}
    actionTitle={actionTitle}
    onActionPress={onActionPress}
  />
);
