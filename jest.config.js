module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '@testing-library/react-native/matchers'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/integration/'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@testing-library|expo-av|expo-document-picker|expo-image-picker|expo-secure-store|expo-notifications|expo-task-manager|expo-background-fetch|expo-modules-core|expo-sqlite|@dariyd/react-native-text-recognition|expo-pdf-text-extract|expo-file-system|expo-modules-core)/)',
  ],
};
