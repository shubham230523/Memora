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

try {
  jest.mock('@expo/vector-icons', () => ({
    MaterialCommunityIcons: 'Icon',
  }));
} catch (e) {}
