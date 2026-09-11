import { ExpoSecureStorage } from '../ExpoSecureStorage';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../../../core/logging/Logger';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../../../core/logging/Logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ExpoSecureStorage', () => {
  let storage: ExpoSecureStorage;

  beforeEach(() => {
    storage = new ExpoSecureStorage();
    jest.clearAllMocks();
  });

  it('setItem should call SecureStore.setItemAsync', async () => {
    await storage.setItem('key', 'value');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('key', 'value');
  });

  it('getItem should call SecureStore.getItemAsync', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('value');
    const val = await storage.getItem('key');
    expect(val).toBe('value');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('key');
  });

  it('removeItem should call SecureStore.deleteItemAsync', async () => {
    await storage.removeItem('key');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key');
  });
});
