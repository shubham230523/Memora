jest.mock('react-native-gesture-handler', () => ({}));
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => ({
    execAsync: jest.fn(async () => {}),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getFirstAsync: jest.fn(async () => null),
    getAllAsync: jest.fn(async () => []),
    withTransactionAsync: jest.fn(async (cb) => await cb()),
  })),
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  hideAsync: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'Icon',
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  getCameraPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  MediaTypeOptions: { Images: 'images' },
}));

jest.mock('expo-audio', () => ({
  setIsAudioActiveAsync: jest.fn(),
  setAudioModeAsync: jest.fn(),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  getRecordingPermissionsAsync: jest.fn(async () => ({ status: 'granted', granted: true })),
  AudioModule: {
    AudioRecorder: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn(),
      record: jest.fn(),
      stop: jest.fn(),
      release: jest.fn(),
      uri: 'file:///mock/audio.m4a',
    })),
  },
  RecordingPresets: { HIGH_QUALITY: {} },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'time_interval' },
}));

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(),
}));

jest.mock('expo-modules-core', () => {
  const { EventEmitter } = require('events');
  return {
    EventEmitter,
    NativeModule: {},
    ProxyNativeModule: {},
    requireNativeModule: jest.fn(),
  };
});

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/',
  cacheDirectory: 'file:///cache/',
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  downloadAsync: jest.fn(),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock/file' }),
  })),
  getContentUriAsync: jest.fn(async (uri) => uri),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/',
  cacheDirectory: 'file:///cache/',
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  downloadAsync: jest.fn(),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock/file' }),
  })),
  getContentUriAsync: jest.fn(async (uri) => uri),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}), { virtual: true });

jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(),
  BackgroundFetchResult: { NewData: 1, NoData: 2, Failed: 3 },
}));

jest.mock('whisper.rn', () => ({
  initWhisper: jest.fn().mockResolvedValue({
    transcribe: jest.fn().mockReturnValue({
      promise: Promise.resolve({ result: 'Mock transcription' })
    }),
    release: jest.fn(),
  }),
}), { virtual: true });
