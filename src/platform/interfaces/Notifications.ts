export interface INotificationProvider {
  scheduleNotification(title: string, body: string, seconds?: number): Promise<string>;
  cancelAllNotifications(): Promise<void>;
  requestPermissions(): Promise<boolean>;
}
