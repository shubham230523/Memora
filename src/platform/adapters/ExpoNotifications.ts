import * as Notifications from 'expo-notifications';
import { INotificationProvider } from '../interfaces/Notifications';

export class ExpoNotifications implements INotificationProvider {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleNotification(title: string, body: string, seconds: number = 5): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
    });
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
