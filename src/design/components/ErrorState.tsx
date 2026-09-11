import React from 'react';
import { FeedbackState } from './FeedbackState';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => (
  <FeedbackState
    type="error"
    icon="alert-circle-outline"
    title={title}
    message={message}
    actionTitle={onRetry ? 'Try Again' : undefined}
    onActionPress={onRetry}
  />
);
