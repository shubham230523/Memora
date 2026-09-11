const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '@testing-library/react-native/matchers',
    '<rootDir>/tests/integration/setup.ts'
  ],
  testPathIgnorePatterns: [],
};
