import { INotificationProvider } from '../interfaces/Notifications';
import { logger } from '../../core/logging/Logger';

let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  logger.warn('expo-notifications not found. Push notifications will be disabled.');
}

export class ExpoNotifications implements INotificationProvider {
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) {
      logger.error('Notifications module is missing');
      return false;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleNotification(title: string, body: string, seconds: number = 5): Promise<string> {
    if (!Notifications) {
      logger.error('Notifications module is missing');
      return 'notification_disabled';
    }
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
    });
  }

  async cancelAllNotifications(): Promise<void> {
    if (!Notifications) {
      logger.error('Notifications module is missing');
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
