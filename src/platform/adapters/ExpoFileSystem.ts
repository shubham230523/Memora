import * as FileSystem from 'expo-file-system/legacy';
import { IFileSystemProvider, DownloadCallback } from '../interfaces/FileSystem';
import { logger } from '../../core/logging/Logger';

export class ExpoFileSystem implements IFileSystemProvider {
  get documentDirectory(): string | null {
    return FileSystem.documentDirectory;
  }

  async downloadFile(url: string, fileUri: string, onProgress?: DownloadCallback): Promise<string> {
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {},
      (progress) => {
        if (onProgress) {
          onProgress({
            totalBytesWritten: progress.totalBytesWritten,
            totalBytesExpectedToWrite: progress.totalBytesExpectedToWrite,
          });
        }
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result) throw new Error('Download failed');
      return result.uri;
    } catch (error) {
      logger.error('Failed to download file', error);
      throw error;
    }
  }

  async exists(fileUri: string): Promise<boolean> {
    try {
      const info = await FileSystem.getInfoAsync(fileUri);
      return info.exists;
    } catch {
      return false;
    }
  }

  async deleteFile(fileUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (error) {
      logger.error('Failed to delete file', error);
      throw error;
    }
  }

  async copyFile(from: string, to: string): Promise<void> {
    try {
      await FileSystem.copyAsync({ from, to });
    } catch (error) {
      logger.error('Failed to copy file', error);
      throw error;
    }
  }

  async writeTextFile(fileUri: string, content: string): Promise<void> {
    try {
      await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
    } catch (error) {
      logger.error('Failed to write file', error);
      throw error;
    }
  }

  async readAsBase64(fileUri: string): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
    } catch (error) {
      logger.error('Failed to read file as base64', error);
      throw error;
    }
  }

  async getContentUri(fileUri: string): Promise<string> {
    try {
      // In SDK 57, getContentUriAsync is available on Android
      // This converts file:// to content:// using Expo's FileProvider
      return await FileSystem.getContentUriAsync(fileUri);
    } catch (error) {
      logger.warn('Failed to get content URI, falling back to original', error);
      return fileUri;
    }
  }
}
