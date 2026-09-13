import { Platform } from '../Platform';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true })),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
}));

jest.mock('expo-audio', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn(),
    },
    setAudioModeAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
    getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'time_interval' },
}));

describe('Platform Abstractions', () => {
  it('FilePicker.pickDocument returns null when canceled', async () => {
    const result = await Platform.FilePicker.pickDocument();
    expect(result).toBeNull();
  });

  it('Camera.requestPermissions returns true when granted', async () => {
    const result = await Platform.Camera.requestPermissions();
    expect(result).toBe(true);
  });
});
