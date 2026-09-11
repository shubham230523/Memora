import * as SecureStore from 'expo-secure-store';
import { ISecureStorageProvider } from '../interfaces/SecureStorage';

export class ExpoSecureStorage implements ISecureStorageProvider {
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
