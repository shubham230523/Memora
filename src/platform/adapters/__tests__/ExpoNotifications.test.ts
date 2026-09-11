import { ExpoNotifications } from '../ExpoNotifications';
import * as Notifications from 'expo-notifications';
import { logger } from '../../../core/logging/Logger';

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'time_interval' },
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExpoNotifications', () => {
  let notifications: ExpoNotifications;

  beforeEach(() => {
    notifications = new ExpoNotifications();
    jest.clearAllMocks();
  });

  it('requestPermissions should return true if granted', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    const granted = await notifications.requestPermissions();
    expect(granted).toBe(true);
  });

  it('scheduleNotification should call expo-notifications', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif-id');
    const id = await notifications.scheduleNotification('Title', 'Body', 10);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: 'Title', body: 'Body' },
      trigger: { type: 'time_interval', seconds: 10 },
    });
    expect(id).toBe('notif-id');
  });

  it('cancelAllNotifications should call expo-notifications', async () => {
    await notifications.cancelAllNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});
