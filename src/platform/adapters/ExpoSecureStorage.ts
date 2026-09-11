import { ISecureStorageProvider } from '../interfaces/SecureStorage';
import { logger } from '../../core/logging/Logger';

let SecureStore: typeof import('expo-secure-store') | null = null;
try {
  SecureStore = require('expo-secure-store');
} catch (e) {
  logger.warn('expo-secure-store not found. Secure storage will be disabled.');
}

export class ExpoSecureStorage implements ISecureStorageProvider {
  async setItem(key: string, value: string): Promise<void> {
    if (!SecureStore) {
      throw new Error('SecureStore module is missing. Cannot save data securely in Memora.');
    }
    await SecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    if (!SecureStore) {
      logger.error('SecureStore module is missing');
      return null;
    }
    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    if (!SecureStore) {
      logger.error('SecureStore module is missing');
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
}
