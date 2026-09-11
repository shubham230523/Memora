import { integrationTestDb } from './helpers/IntegrationTestDb';
import { TestAIProvider } from './helpers/TestAIProvider';
import { Platform } from '../../src/platform/Platform';

// Globally intercept and mock expo-sqlite using lazy require to avoid out-of-scope hoisting error
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async (name: string) => {
    const { integrationTestDb } = require('./helpers/IntegrationTestDb');
    return integrationTestDb.openDatabaseAsync(name);
  }),
}));

// Provide high-fidelity in-memory secure storage double
const secureStorageMemory: Record<string, string> = {};
Platform.SecureStorage = {
  getItem: jest.fn(async (key: string) => secureStorageMemory[key] || null),
  setItem: jest.fn(async (key: string, value: string) => { secureStorageMemory[key] = value; }),
  removeItem: jest.fn(async (key: string) => { delete secureStorageMemory[key]; }),
};

// Implement OCR double
Platform.OCR = {
  recognizeText: jest.fn(async (uri: string) => `Recognized text from OCR image fixture at ${uri}`),
};

// Implement Microphone/Audio recording double
Platform.Microphone = {
  requestPermissions: jest.fn(async () => true),
  startRecording: jest.fn(async () => {}),
  stopRecording: jest.fn(async () => 'file://test-audio-recording.m4a'),
};

// Implement local AI runtime mock state hooks
let localAIModelReady = false;
Platform.LocalAI = {
  isModelReady: jest.fn(async () => localAIModelReady),
  setModelReady: (ready: boolean) => { localAIModelReady = ready; },
  generate: jest.fn(async (req) => new TestAIProvider().generate(req)),
  streamGenerate: jest.fn(async (req, onChunk) => new TestAIProvider().streamGenerate(req, onChunk)),
} as any;

// Automatically reset storage before each integration test
beforeEach(() => {
  integrationTestDb.reset();
  TestAIProvider.clear();
  localAIModelReady = false;
  for (const key of Object.keys(secureStorageMemory)) {
    delete secureStorageMemory[key];
  }
});
